import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { PlanningRoleInlineCreate } from './PlanningRoleInlineCreate'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'created-role', version: 1 })

vi.mock('../../hooks/useCreatePlanningRole', () => ({
  useCreatePlanningRole: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

function Fixture({ onRoleCreated = vi.fn() }: { onRoleCreated?: (roleId: string) => void }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(
      PlanningRoleInlineCreate,
      { projectId: 'proj1', onRoleCreated },
      createElement('button', { type: 'button' }, '+ Neue Rolle'),
    ),
  )
}

describe('PlanningRoleInlineCreate', () => {
  it('renders the trigger and no form initially', () => {
    render(createElement(Fixture, {}))
    expect(screen.getByRole('button', { name: '+ Neue Rolle' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
  })

  it('opens popover with name and capacity fields on trigger click', async () => {
    const user = userEvent.setup()
    render(createElement(Fixture, {}))
    await user.click(screen.getByRole('button', { name: '+ Neue Rolle' }))
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/kapazität/i)).toBeInTheDocument()
    })
  })

  it('calls mutateAsync and onRoleCreated with role id after valid submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'created-role', version: 1 })
    const onRoleCreated = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { onRoleCreated }))
    await user.click(screen.getByRole('button', { name: '+ Neue Rolle' }))
    await waitFor(() => screen.getByLabelText(/name/i))

    await user.type(screen.getByLabelText(/name/i), 'Meine Rolle')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Meine Rolle',
        capacityPerWeek: 1,
      })
      expect(onRoleCreated).toHaveBeenCalledWith('created-role')
    })
  })

  it('shows server error when mutation rejects with DUPLICATE_PLANNING_ROLE_NAME', async () => {
    mockMutateAsync.mockRejectedValue(new Error('DUPLICATE_PLANNING_ROLE_NAME'))
    const user = userEvent.setup()

    render(createElement(Fixture, {}))
    await user.click(screen.getByRole('button', { name: '+ Neue Rolle' }))
    await waitFor(() => screen.getByLabelText(/name/i))

    await user.type(screen.getByLabelText(/name/i), 'Doppelt')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Eine Planungsrolle mit diesem Namen existiert bereits/i),
      ).toBeInTheDocument()
    })
  })

  it('shows generic save error when mutation rejects with non-duplicate error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()

    render(createElement(Fixture, {}))
    await user.click(screen.getByRole('button', { name: '+ Neue Rolle' }))
    await waitFor(() => screen.getByLabelText(/name/i))

    await user.type(screen.getByLabelText(/name/i), 'Eine Rolle')
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(screen.getByText(/Speichern fehlgeschlagen/i)).toBeInTheDocument()
    })
  })

  it('closes the popover and resets form when cancel is clicked', async () => {
    const user = userEvent.setup()

    render(createElement(Fixture, {}))
    await user.click(screen.getByRole('button', { name: '+ Neue Rolle' }))
    await waitFor(() => screen.getByLabelText(/name/i))

    await user.type(screen.getByLabelText(/name/i), 'Some Name')
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    })
  })
})
