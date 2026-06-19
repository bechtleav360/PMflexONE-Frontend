import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemEntities from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import { CommentThread } from './CommentThread'

const mockDeleteComment = vi.fn().mockResolvedValue(true)
const mockUpdateComment = vi.fn().mockResolvedValue({ id: 'c-1', version: 2, text: 'updated' })

vi.mock('../../hooks/useDeleteComment', () => ({
  useDeleteComment: () => ({ mutateAsync: mockDeleteComment, isPending: false }),
}))

vi.mock('../../hooks/useUpdateComment', () => ({
  useUpdateComment: () => ({ mutateAsync: mockUpdateComment, isPending: false }),
}))

vi.mock('../../hooks/useCreateComment', () => ({
  useCreateComment: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
}))

vi.mock('@/shared/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: { id: 'user-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' },
  }),
}))

const fixtureComments = [
  {
    id: 'c-1',
    version: 1,
    text: '**Hello** world',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    metadata: null,
    creator: { id: 'user-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' },
    attachments: [],
    scope: null,
  },
  {
    id: 'c-2',
    version: 1,
    text: 'Another comment',
    createdAt: '2026-01-01T11:00:00Z',
    updatedAt: '2026-01-01T11:00:00Z',
    metadata: null,
    creator: { id: 'user-2', firstName: 'Bob', lastName: 'Jones', mail: 'bob@test.com' },
    attachments: [],
    scope: null,
  },
]

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemEntities>()
  return {
    ...actual,
    useComments: () => ({ data: fixtureComments, isLoading: false }),
  }
})

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
  mockDeleteComment.mockClear()
  mockUpdateComment.mockClear()
})

describe('CommentThread', () => {
  it('renders comments with author names', () => {
    const Wrapper = makeWrapper()
    render(createElement(Wrapper, null, createElement(CommentThread, { workItemId: 'wi-1' })))
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('shows edit and delete controls only for current user comments', () => {
    const Wrapper = makeWrapper()
    render(createElement(Wrapper, null, createElement(CommentThread, { workItemId: 'wi-1' })))
    // Current user (user-1 / Alice) should have edit/delete controls
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    // Only one comment belongs to current user
    expect(editButtons).toHaveLength(1)
    expect(deleteButtons).toHaveLength(1)
  })

  it('calls deleteComment with correct id when delete is clicked and confirmed', async () => {
    const Wrapper = makeWrapper()
    render(createElement(Wrapper, null, createElement(CommentThread, { workItemId: 'wi-1' })))
    const user = userEvent.setup()
    const deleteBtn = screen.getByRole('button', { name: /delete comment/i })
    await user.click(deleteBtn)
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(mockDeleteComment).toHaveBeenCalledOnce()
    })

    const callArg = mockDeleteComment.mock.calls[0][0] as { id: string }
    expect(callArg.id).toBe('c-1')
  })
})
