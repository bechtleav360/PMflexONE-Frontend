import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { RoleGroup } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { DeleteGovernanceGroupDialog } from './DeleteGovernanceGroupDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useDeleteRoleGroup', () => ({
  useDeleteRoleGroup: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(() => ({
    closeAll: mockCloseAll,
  })),
}))

const GROUP: RoleGroup = {
  id: 'grp-1',
  name: 'Management',
  description: null,
  sortOrder: 0,
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
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

function renderDialog(overrides: { open?: boolean; group?: RoleGroup | null } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(DeleteGovernanceGroupDialog, {
        open: overrides.open ?? true,
        group: overrides.group !== undefined ? overrides.group : GROUP,
      }),
    ),
  )
}

describe('DeleteGovernanceGroupDialog — visibility', () => {
  it('renders dialog when open is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the group name in the dialog body', () => {
    renderDialog()
    expect(screen.getByText(/management/i)).toBeInTheDocument()
  })
})

describe('DeleteGovernanceGroupDialog — confirm', () => {
  it('calls useDeleteRoleGroup with the group id on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByTestId('delete-confirm-btn'))
    expect(mockMutateAsync).toHaveBeenCalledWith('grp-1')
  })

  it('calls closeAll after successful deletion', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByTestId('delete-confirm-btn'))
    expect(mockCloseAll).toHaveBeenCalled()
  })

  it('does not call mutation when group is null', async () => {
    const user = userEvent.setup()
    renderDialog({ group: null })
    await user.click(screen.getByTestId('delete-confirm-btn'))
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})

describe('DeleteGovernanceGroupDialog — cancel', () => {
  it('calls closeAll when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
