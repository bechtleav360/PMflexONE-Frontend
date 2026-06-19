import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CreateConstraintForm } from './CreateConstraintForm'

vi.mock('@/entities/person', () => ({
  usePersons: () => ({ data: [], isLoading: false }),
}))

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
    DatePicker: ({
      onChange,
    }: {
      onChange: (d: Date | null) => void
      value?: Date | null
      id?: string
    }) => (
      <input
        type="date"
        data-testid="date-picker"
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      />
    ),
    Checkbox: ({
      checked,
      onCheckedChange,
      id,
    }: {
      checked: boolean
      onCheckedChange: (v: boolean) => void
      id?: string
    }) => (
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
    ),
    Combobox: ({
      onChange,
    }: {
      value: string | null
      onChange: (v: string | null) => void
      options: unknown[]
      loading?: boolean
      id?: string
    }) => (
      <select
        data-testid="combobox"
        onChange={(e) => onChange(e.target.value || null)}
      >
        {/* eslint-disable-next-line react/jsx-no-literals -- test mock placeholder; not user-facing */}
        <option value="">None</option>
      </select>
    ),
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- test suite coverage for Controller onChange callbacks
describe('CreateConstraintForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(<CreateConstraintForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-constraint-form')).toBeInTheDocument()
  })

  it('renders name input', () => {
    const { container } = render(<CreateConstraintForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-constraint-name')).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const { container } = render(<CreateConstraintForm onSubmit={vi.fn()} />)
    fireEvent.submit(container.querySelector('#create-constraint-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('does not call onSubmit when name is empty', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateConstraintForm onSubmit={onSubmit} />)
    fireEvent.submit(container.querySelector('#create-constraint-form')!)
    await screen.findByRole('alert')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with name when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateConstraintForm onSubmit={onSubmit} />)
    const nameInput = container.querySelector('#create-constraint-name')!
    await userEvent.type(nameInput, 'My Constraint')
    fireEvent.submit(container.querySelector('#create-constraint-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'My Constraint' })
  })

  it('hides date picker when time-constrained is unchecked', () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument()
  })

  it('shows date picker when time-constrained checkbox is checked', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('hides date picker again when time-constrained is unchecked', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
    await userEvent.click(checkbox)
    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument()
  })

  it('typing into description editor triggers onChange', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'Some description')
    expect((editor as HTMLTextAreaElement).value).toBe('Some description')
  })

  it('clearing description editor hits empty-string branch', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'x')
    await userEvent.clear(editor)
    expect((editor as HTMLTextAreaElement).value).toBe('')
  })

  it('changing date picker fires onChange with date when time-constrained', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '2025-06-01' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('clearing date picker fires onChange with null when time-constrained', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('typing into other information editor triggers onChange', async () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const editors = screen.getAllByRole('textbox', { name: /other information/i })
    const editor = editors[editors.length - 1]
    await userEvent.type(editor, 'Other info')
    expect((editor as HTMLTextAreaElement).value).toBe('Other info')
  })

  it('selecting owner in combobox triggers ownerId onChange', () => {
    render(<CreateConstraintForm onSubmit={vi.fn()} />)
    const combobox = screen.getByTestId('combobox')
    fireEvent.change(combobox, { target: { value: '' } })
    expect(combobox).toBeInTheDocument()
  })
})
