import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { CommentForm } from './CommentForm'

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useCreateComment', () => ({
  useCreateComment: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

// MarkdownEditor is a controlled textarea-based component — stub it as a plain textarea
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      placeholder,
      ariaLabel,
      disabled,
    }: {
      value: string
      onChange: (v: string) => void
      placeholder?: string
      ariaLabel?: string
      disabled?: boolean
    }) => (
      <textarea
        aria-label={ariaLabel ?? placeholder ?? 'editor'}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  }
})

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
})

function renderForm() {
  const Wrapper = makeWrapper()
  render(createElement(Wrapper, null, createElement(CommentForm, { workItemId: 'wi-1' })))
}

describe('CommentForm — rendering', () => {
  it('renders a textarea for comment input', () => {
    renderForm()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /add comment/i })).toBeInTheDocument()
  })

  it('submit button is disabled when textarea is empty', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /add comment/i })).toBeDisabled()
  })
})

describe('CommentForm — submit', () => {
  it('calls useCreateComment with the entered text on submit', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByRole('textbox'), 'My comment')
    await user.click(screen.getByRole('button', { name: /add comment/i }))
    expect(mockMutateAsync).toHaveBeenCalledWith({ text: 'My comment' })
  })

  it('clears the textarea after successful submission', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByRole('textbox'), 'My comment')
    await user.click(screen.getByRole('button', { name: /add comment/i }))
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('does not call mutation when text is only whitespace', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByRole('textbox'), '   ')
    // Button stays disabled for whitespace-only input
    expect(screen.getByRole('button', { name: /add comment/i })).toBeDisabled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
