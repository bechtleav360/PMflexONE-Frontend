import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { DeleteBoardDialog } from './DeleteBoardDialog'

const mockMutateAsync = vi.fn().mockResolvedValue(undefined)

vi.mock('../../hooks/useDeleteBoard', () => ({
  useDeleteBoard: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

function renderDialog(open = true, onOpenChange = vi.fn(), onDeleted = vi.fn()) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(DeleteBoardDialog, {
        boardId: 'board-1',
        open,
        onOpenChange,
        onDeleted,
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('DeleteBoardDialog', () => {
  it('renders the dialog title when open', () => {
    renderDialog()
    expect(screen.getByText(/delete board/i)).toBeInTheDocument()
  })

  it('renders the warning message', () => {
    renderDialog()
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDialog(true, onOpenChange)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls mutateAsync and then onOpenChange + onDeleted when Delete is confirmed', async () => {
    const onOpenChange = vi.fn()
    const onDeleted = vi.fn()
    mockMutateAsync.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderDialog(true, onOpenChange, onDeleted)

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(mockMutateAsync).toHaveBeenCalledWith('board-1')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onDeleted).toHaveBeenCalledOnce()
  })

  it('does not render dialog content when closed', () => {
    renderDialog(false)
    expect(screen.queryByText(/delete board/i)).not.toBeInTheDocument()
  })
})
