import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import { ResetColumnDialog } from './ResetColumnDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useResetRolePermissions', () => ({
  useResetRolePermissions: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(),
}))

const mockUseRasciMatrixStore = vi.mocked(useRasciMatrixStore)

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
  mockUseRasciMatrixStore.mockReturnValue({
    selectedColumnRoleId: 'role-1',
    closeAll: mockCloseAll,
  } as ReturnType<typeof useRasciMatrixStore>)
})

function renderDialog(overrides: { open?: boolean } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(ResetColumnDialog, {
        open: overrides.open ?? true,
        objectId: 'obj-1',
        domainType: 'PROJECT' as const,
      }),
    ),
  )
}

describe('ResetColumnDialog — visibility', () => {
  it('renders dialog when open is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('ResetColumnDialog — confirm', () => {
  it('calls useResetRolePermissions with correct arguments on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByTestId('reset-column-confirm-btn'))
    expect(mockMutateAsync).toHaveBeenCalledWith({
      objectId: 'obj-1',
      domainType: 'PROJECT',
      roleId: 'role-1',
    })
  })

  it('calls closeAll after successful confirmation', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByTestId('reset-column-confirm-btn'))
    expect(mockCloseAll).toHaveBeenCalled()
  })

  it('does not call mutation when selectedColumnRoleId is null', async () => {
    mockUseRasciMatrixStore.mockReturnValue({
      selectedColumnRoleId: null,
      closeAll: mockCloseAll,
    } as ReturnType<typeof useRasciMatrixStore>)
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByTestId('reset-column-confirm-btn'))
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})

describe('ResetColumnDialog — cancel', () => {
  it('calls closeAll when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
