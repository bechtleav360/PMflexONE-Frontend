import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateBoardDialogStore } from '../../store/boardDialogStores'
import { CreateBoardDialog } from './CreateBoardDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'board-new', name: 'New Board' })

vi.mock('../../hooks/useCreateBoard', () => ({
  useCreateBoard: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutateAsync.mockClear()
  useCreateBoardDialogStore.setState({ open: false })
})

describe('CreateBoardDialog', () => {
  it('does not render when store is closed', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateBoardDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when store is open', () => {
    useCreateBoardDialogStore.setState({ open: true })
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateBoardDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /board name/i })).toBeInTheDocument()
  })

  it('does not submit when board name is empty', async () => {
    useCreateBoardDialogStore.setState({ open: true })
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateBoardDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    const user = userEvent.setup()

    // Do NOT fill board name — submit with empty name
    await user.click(screen.getByRole('button', { name: /create|submit|save/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
    // Dialog stays open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('calls createBoard mutation with correct data when all base statuses are present', async () => {
    useCreateBoardDialogStore.setState({ open: true })
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(CreateBoardDialog, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /board name/i }), 'Sprint Board')

    // The dialog should pre-populate default columns covering all three base statuses
    // (open, in_progress, done) — submit should succeed
    const submitBtn = screen.getByRole('button', { name: /create|submit|save/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledOnce()
    })

    const callArg = mockMutateAsync.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(callArg.input.name).toBe('Sprint Board')
    expect(callArg.input.scopeId).toBe('proj-1')
    const cols = callArg.input.columns as Array<{ workItemStatus: string }>
    const statuses = cols.map((c) => c.workItemStatus)
    expect(statuses).toContain('OPEN')
    expect(statuses).toContain('IN_PROGRESS')
    expect(statuses).toContain('DONE')
  })
})
