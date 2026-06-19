import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Comment } from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import { CommentItem } from './CommentItem'

const mockDeleteComment = vi.fn().mockResolvedValue({})
const mockUpdateComment = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useDeleteComment', () => ({
  useDeleteComment: () => ({ mutateAsync: mockDeleteComment }),
}))

vi.mock('../../hooks/useUpdateComment', () => ({
  useUpdateComment: () => ({ mutateAsync: mockUpdateComment }),
}))

vi.mock('@/shared/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: { id: 'user-1', firstName: 'Anna', lastName: 'Müller', mail: 'anna@example.com' },
  }),
}))

// Stub MarkdownEditor as a controlled textarea
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      disabled,
    }: {
      value: string
      onChange?: (v: string) => void
      disabled?: boolean
    }) => (
      <textarea
        aria-label="markdown editor"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={!onChange}
      />
    ),
  }
})

const COMMENT: Comment = {
  id: 'c-1',
  version: 1,
  text: 'Hello world',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
  metadata: null,
  creator: { id: 'user-1', firstName: 'Anna', lastName: 'Müller', mail: 'anna@example.com' },
  attachments: [],
  scope: null,
}

const OTHER_COMMENT: Comment = {
  ...COMMENT,
  id: 'c-2',
  creator: { id: 'user-2', firstName: 'Bob', lastName: 'Smith', mail: 'bob@example.com' },
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
  mockDeleteComment.mockReset().mockResolvedValue({})
  mockUpdateComment.mockReset().mockResolvedValue({})
})

function renderComment(comment = COMMENT) {
  const Wrapper = makeWrapper()
  render(createElement(Wrapper, null, createElement(CommentItem, { workItemId: 'wi-1', comment })))
}

describe('CommentItem — rendering', () => {
  it('shows the author name', () => {
    renderComment()
    expect(screen.getByText('Anna Müller')).toBeInTheDocument()
  })

  it('shows the comment text in the markdown viewer', () => {
    renderComment()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows edit and delete buttons for comment author', () => {
    renderComment()
    expect(screen.getByRole('button', { name: /edit comment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete comment/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons for other users', () => {
    renderComment(OTHER_COMMENT)
    expect(screen.queryByRole('button', { name: /edit comment/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete comment/i })).not.toBeInTheDocument()
  })
})

describe('CommentItem — delete', () => {
  it('calls useDeleteComment when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    renderComment()
    await user.click(screen.getByRole('button', { name: /delete comment/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(mockDeleteComment).toHaveBeenCalledWith({ id: 'c-1' })
  })
})

describe('CommentItem — edit', () => {
  it('shows Save and Cancel buttons when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderComment()
    await user.click(screen.getByRole('button', { name: /edit comment/i }))
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls useUpdateComment with updated text on save', async () => {
    const user = userEvent.setup()
    renderComment()
    await user.click(screen.getByRole('button', { name: /edit comment/i }))
    const textareas = screen.getAllByRole('textbox')
    const editArea = textareas.find((el) => !el.hasAttribute('disabled'))!
    await user.clear(editArea)
    await user.type(editArea, 'Updated text')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockUpdateComment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'c-1', text: 'Updated text' }),
    )
  })

  it('hides Save/Cancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderComment()
    await user.click(screen.getByRole('button', { name: /edit comment/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })
})
