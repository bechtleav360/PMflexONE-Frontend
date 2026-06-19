import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { DeleteObjectRoleDialog } from './DeleteObjectRoleDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useDeleteObjectRole', () => ({
  useDeleteObjectRole: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    selectedColumnRoleId: 'role-1',
    closeAll: mockCloseAll,
  })),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog(overrides: { open?: boolean; roleName?: string } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(DeleteObjectRoleDialog, {
        open: overrides.open ?? true,
        objectId: 'obj-1',
        domainType: 'PROJECT' as const,
        roleName: overrides.roleName ?? 'Project Manager',
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

describe('DeleteObjectRoleDialog — rendering', () => {
  it('renders confirmation dialog when open', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays the role name in the confirmation body', () => {
    renderDialog({ roleName: 'Project Manager' })
    expect(screen.getByText(/project manager/i)).toBeInTheDocument()
  })
})

describe('DeleteObjectRoleDialog — confirm', () => {
  it('calls useDeleteObjectRole with correct arguments on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()

    const confirmButton = screen.getByRole('button', { name: /delete|confirm|remove/i })
    await user.click(confirmButton)

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'role-1',
        objectId: 'obj-1',
        domainType: 'PROJECT',
      }),
    )
  })
})

describe('DeleteObjectRoleDialog — cancel', () => {
  it('calls store.closeAll when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
