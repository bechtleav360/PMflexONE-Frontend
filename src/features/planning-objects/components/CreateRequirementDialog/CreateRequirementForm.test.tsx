import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CreateRequirementForm } from './CreateRequirementForm'

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      ariaLabel,
    }: {
      value: string
      onChange: (v: string) => void
      ariaLabel?: string
    }) => (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
    ),
    Select: ({
      children,
    }: {
      children: React.ReactNode
      onValueChange?: (v: string) => void
      value?: string
    }) => <div data-testid="select">{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <div data-value={value}>{children}</div>
    ),
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('CreateRequirementForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(<CreateRequirementForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-requirement-form')).toBeInTheDocument()
  })

  it('renders name input', () => {
    const { container } = render(<CreateRequirementForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-req-name')).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const { container } = render(<CreateRequirementForm onSubmit={vi.fn()} />)
    fireEvent.submit(container.querySelector('#create-requirement-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('does not call onSubmit when name is empty', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateRequirementForm onSubmit={onSubmit} />)
    fireEvent.submit(container.querySelector('#create-requirement-form')!)
    await screen.findByRole('alert')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with name when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateRequirementForm onSubmit={onSubmit} />)
    const nameInput = container.querySelector('#create-req-name')!
    await userEvent.type(nameInput, 'My Requirement')
    fireEvent.submit(container.querySelector('#create-requirement-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'My Requirement' })
  })

  it('renders description markdown editor', () => {
    render(<CreateRequirementForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument()
  })

  it('renders effort min and max inputs', () => {
    const { container } = render(<CreateRequirementForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-req-effort-min')).toBeInTheDocument()
    expect(container.querySelector('#create-req-effort-max')).toBeInTheDocument()
  })

  it('typing into description editor triggers onChange', async () => {
    render(<CreateRequirementForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'Some description')
    expect((editor as HTMLTextAreaElement).value).toBe('Some description')
  })

  it('clearing description editor hits empty-string branch', async () => {
    render(<CreateRequirementForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'x')
    await userEvent.clear(editor)
    expect((editor as HTMLTextAreaElement).value).toBe('')
  })

  it('typing into acceptance criteria editor triggers onChange', async () => {
    render(<CreateRequirementForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /acceptance criteria/i })
    await userEvent.type(editor, 'Must pass all tests')
    expect((editor as HTMLTextAreaElement).value).toBe('Must pass all tests')
  })

  it('clearing acceptance criteria editor hits empty-string branch', async () => {
    render(<CreateRequirementForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /acceptance criteria/i })
    await userEvent.type(editor, 'x')
    await userEvent.clear(editor)
    expect((editor as HTMLTextAreaElement).value).toBe('')
  })
})
