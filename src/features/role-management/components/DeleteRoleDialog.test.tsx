import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrixRole } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { DeleteRoleDialog } from './DeleteRoleDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useDeleteRole', () => ({
  useDeleteRole: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(() => ({
    closeAll: mockCloseAll,
  })),
}))

const MUTABLE_ROLE: MatrixRole = {
  id: 'role-1',
  name: 'Project Manager',
  shortTitle: 'PM',
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
}

const FIXED_ROLE: MatrixRole = {
  id: 'role-2',
  name: 'System Role',
  shortTitle: 'SYS',
  description: null,
  isFixed: true,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
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
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

function renderDialog(props: { open?: boolean; role?: MatrixRole | null; matrixId?: string } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(DeleteRoleDialog, {
        open: props.open ?? true,
        role: props.role ?? MUTABLE_ROLE,
        matrixId: props.matrixId ?? 'matrix-1',
      }),
    ),
  )
}

describe('DeleteRoleDialog — visibility', () => {
  it('renders confirmation dialog when open is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the role name in the dialog body', () => {
    renderDialog()
    expect(screen.getByText(/project manager/i)).toBeInTheDocument()
  })
})

describe('DeleteRoleDialog — fixed role', () => {
  it('shows info text when role isFixed is true', () => {
    renderDialog({ role: FIXED_ROLE })
    expect(screen.getByText(/system role|cannot be deleted/i)).toBeInTheDocument()
  })
})

describe('DeleteRoleDialog — actions', () => {
  it('calls mutation when Confirm (Delete) is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('calls closeAll when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
