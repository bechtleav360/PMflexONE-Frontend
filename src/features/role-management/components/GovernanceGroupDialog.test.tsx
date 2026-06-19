import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RoleGroup } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { GovernanceGroupDialog } from './GovernanceGroupDialog'

const mockAddMutateAsync = vi.fn().mockResolvedValue({})
const mockEditMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useAddRoleGroup', () => ({
  useAddRoleGroup: () => ({
    mutateAsync: mockAddMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../hooks/useEditRoleGroup', () => ({
  useEditRoleGroup: () => ({
    mutateAsync: mockEditMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(() => ({
    closeAll: mockCloseAll,
  })),
}))

const EXISTING_GROUP: RoleGroup = {
  id: 'grp-1',
  name: 'Management',
  description: 'Management group',
  sortOrder: 1,
  color: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockAddMutateAsync.mockReset().mockResolvedValue({})
  mockEditMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

function renderDialog(props: { open?: boolean; group?: RoleGroup | null } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(GovernanceGroupDialog, {
        open: props.open ?? true,
        group: props.group ?? null,
      }),
    ),
  )
}

describe('GovernanceGroupDialog — create mode', () => {
  it('renders dialog with empty form in create mode', () => {
    renderDialog({ group: null })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/^name/i)).toHaveValue('')
  })

  it('shows "New Group" title in create mode', () => {
    renderDialog({ group: null })
    expect(screen.getByRole('heading', { name: /new group/i })).toBeInTheDocument()
  })

  it('calls createRoleGroup mutation on submit', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.type(screen.getByLabelText(/^name/i), 'New Group')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockAddMutateAsync).toHaveBeenCalled())
  })
})

describe('GovernanceGroupDialog — edit mode', () => {
  it('shows "Edit Role Group" title in edit mode', () => {
    renderDialog({ group: EXISTING_GROUP })
    expect(screen.getByRole('heading', { name: /edit role group/i })).toBeInTheDocument()
  })

  it('pre-fills form with existing group values', () => {
    renderDialog({ group: EXISTING_GROUP })
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Management')
  })

  it('calls editRoleGroup mutation on submit', async () => {
    const user = userEvent.setup()
    renderDialog({ group: EXISTING_GROUP })
    await user.clear(screen.getByLabelText(/^name/i))
    await user.type(screen.getByLabelText(/^name/i), 'Updated Group')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockEditMutateAsync).toHaveBeenCalled())
  })
})

describe('GovernanceGroupDialog — validation', () => {
  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByText(/too small|required|invalid|characters/i)).toBeInTheDocument()
    })
  })
})

describe('GovernanceGroupDialog — cancel', () => {
  it('calls closeAll when Cancel is clicked without mutating', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockAddMutateAsync).not.toHaveBeenCalled()
  })
})

describe('GovernanceGroupDialog — sortOrder field', () => {
  it('falls back to 0 when sortOrder input is cleared (NaN branch)', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    const sortOrderInput = screen.getByLabelText(/sort order/i)
    await user.clear(sortOrderInput)
    // Clearing produces NaN from parseInt — the || 0 fallback sets value to 0
    expect(sortOrderInput).toHaveValue(0)
  })

  it('submits with a valid non-zero sortOrder', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.type(screen.getByLabelText(/^name/i), 'Test Group')
    const sortOrderInput = screen.getByLabelText(/sort order/i)
    await user.clear(sortOrderInput)
    await user.type(sortOrderInput, '5')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mockAddMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ sortOrder: 5 })),
    )
  })
})

describe('GovernanceGroupDialog — color field', () => {
  it('submits with a color value when color is provided', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.type(screen.getByLabelText(/^name/i), 'Test Group')
    const colorInput = screen.getByPlaceholderText(/#RRGGBB/)
    await user.clear(colorInput)
    await user.type(colorInput, 'FF0000')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockAddMutateAsync).toHaveBeenCalled())
  })
})
