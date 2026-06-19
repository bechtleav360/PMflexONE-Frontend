import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { PlanningRoleFormDialog } from './PlanningRoleFormDialog'

const mockCreateMutateAsync = vi.fn().mockResolvedValue({ id: 'new-role', version: 1 })
const mockUpdateMutateAsync = vi.fn().mockResolvedValue({ id: 'r1', version: 2 })

vi.mock('../../hooks/useCreatePlanningRole', () => ({
  useCreatePlanningRole: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../../hooks/useUpdatePlanningRole', () => ({
  useUpdatePlanningRole: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
}))

const MOCK_ROLES = [
  { id: 'r1', name: 'Dev Role', capacityPerWeek: 2, version: 1, userAssignments: [] },
]

let mockRolesIsPending = false

vi.mock('../../hooks/usePlanningRoles', () => ({
  usePlanningRoles: () => ({
    data: mockRolesIsPending ? undefined : MOCK_ROLES,
    isPending: mockRolesIsPending,
  }),
}))

vi.mock('./UserAssignmentsSection', () => ({
  UserAssignmentsSection: () => createElement('div', { 'data-testid': 'user-assignments-section' }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateMutateAsync.mockResolvedValue({ id: 'new-role', version: 1 })
  mockUpdateMutateAsync.mockResolvedValue({ id: 'r1', version: 2 })
  mockRolesIsPending = false
})

interface FixtureProps {
  open: boolean
  planningRoleId?: string | null
  onOpenChange?: (open: boolean) => void
  onSaved?: () => void
}

function Fixture({
  open,
  planningRoleId = null,
  onOpenChange = vi.fn(),
  onSaved = vi.fn(),
}: FixtureProps) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(PlanningRoleFormDialog, {
      projectId: 'proj1',
      planningRoleId,
      open,
      onOpenChange,
      onSaved,
    }),
  )
}

// eslint-disable-next-line max-lines-per-function -- test suite with multiple it() blocks
describe('PlanningRoleFormDialog', () => {
  it('does not render when closed', () => {
    render(createElement(Fixture, { open: false }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows create title, name field and capacity field in create mode', async () => {
    render(createElement(Fixture, { open: true }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Planungsrolle anlegen' })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kapazität pro woche/i)).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const user = userEvent.setup()
    render(createElement(Fixture, { open: true }))
    await waitFor(() => screen.getByRole('dialog'))

    // Clear the name field and submit
    const nameInput = screen.getByLabelText(/name/i)
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(screen.getByText(/pflichtfeld/i)).toBeInTheDocument()
    })
    expect(mockCreateMutateAsync).not.toHaveBeenCalled()
  })

  it('calls createMutation.mutateAsync on valid create submit', async () => {
    mockCreateMutateAsync.mockResolvedValue({ id: 'new-role', version: 1 })
    const onSaved = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, onSaved }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.type(screen.getByLabelText(/name/i), 'Neue Rolle')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        name: 'Neue Rolle',
        capacityPerWeek: 1,
      })
      expect(onSaved).toHaveBeenCalled()
    })
  })

  it('pre-fills name and capacity in edit mode', async () => {
    render(createElement(Fixture, { open: true, planningRoleId: 'r1' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Planungsrolle bearbeiten' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Dev Role')
    })
    expect(screen.getByTestId('user-assignments-section')).toBeInTheDocument()
  })

  it('calls onOpenChange(false) on cancel when form is not dirty', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, onOpenChange }))
    await waitFor(() => screen.getByRole('dialog'))

    // Click Cancel without changing anything — form is clean, so dialog closes immediately
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows duplicate error when submitted name matches an existing role', async () => {
    const user = userEvent.setup()
    // 'Dev Role' already exists in mockRoles
    render(createElement(Fixture, { open: true }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.type(screen.getByLabelText(/name/i), 'Dev Role')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      // The field-level error is set via form.setError — mutation must NOT be called
      expect(mockCreateMutateAsync).not.toHaveBeenCalled()
    })
  })

  it('shows server error when create mutation rejects', async () => {
    mockCreateMutateAsync.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true }))
    await waitFor(() => screen.getByRole('dialog'))

    await user.type(screen.getByLabelText(/name/i), 'Unique Role')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(screen.getByText(/speichern fehlgeschlagen/i)).toBeInTheDocument()
    })
  })

  it('shows skeleton loaders in edit mode while roles are loading', async () => {
    mockRolesIsPending = true
    render(createElement(Fixture, { open: true, planningRoleId: 'unknown-role' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    // Skeleton uses data-slot="skeleton" — no form fields are rendered yet
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
  })

  it('calls updateMutation when submitting in edit mode', async () => {
    mockUpdateMutateAsync.mockResolvedValue({ id: 'r1', version: 2 })
    const onSaved = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { open: true, planningRoleId: 'r1', onSaved }))
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Dev Role')
    })

    // Clear name and type a new one to avoid duplicate detection
    await user.clear(screen.getByLabelText(/name/i))
    await user.type(screen.getByLabelText(/name/i), 'Updated Role')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: 'r1',
        input: { version: 1, name: 'Updated Role', capacityPerWeek: 2 },
      })
      expect(onSaved).toHaveBeenCalled()
    })
  })
})
