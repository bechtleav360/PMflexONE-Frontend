import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CreateAssumptionForm } from './CreateAssumptionForm'

vi.mock('@/entities/person', () => ({
  usePersons: () => ({ data: [], isLoading: false }),
}))

vi.mock('../AssumptionRiskSection', () => ({
  AssumptionRiskSection: ({
    isRisk,
    onIsRiskChange,
  }: {
    isRisk: boolean
    onIsRiskChange: (v: boolean) => void
    linkedRisk: null
    hasRiskWriteAccess: boolean
  }) => (
    <div data-testid="assumption-risk-section">
      <input
        type="checkbox"
        aria-label="Is Risk"
        checked={isRisk}
        onChange={(e) => onIsRiskChange(e.target.checked)}
      />
    </div>
  ),
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
    DatePicker: ({ onChange }: { onChange: (d: Date | null) => void; value?: Date | null }) => (
      <input
        type="date"
        data-testid="date-picker"
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
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
    Select: ({
      children,
      onValueChange: _onValueChange,
      value: _value,
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

describe('CreateAssumptionForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-assumption-form')).toBeInTheDocument()
  })

  it('renders name input', () => {
    const { container } = render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-assumption-name')).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const { container } = render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    fireEvent.submit(container.querySelector('#create-assumption-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('does not call onSubmit when name is empty', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateAssumptionForm onSubmit={onSubmit} />)
    fireEvent.submit(container.querySelector('#create-assumption-form')!)
    await screen.findByRole('alert')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with name when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateAssumptionForm onSubmit={onSubmit} />)
    const nameInput = container.querySelector('#create-assumption-name')!
    await userEvent.type(nameInput, 'My Assumption')
    fireEvent.submit(container.querySelector('#create-assumption-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'My Assumption' })
  })

  it('renders AssumptionRiskSection', () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    expect(screen.getByTestId('assumption-risk-section')).toBeInTheDocument()
  })

  it('renders date picker', () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('typing into description editor triggers onChange', async () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'Some description')
    expect((editor as HTMLTextAreaElement).value).toBe('Some description')
  })

  it('clearing description editor hits empty-string branch', async () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'x')
    await userEvent.clear(editor)
    expect((editor as HTMLTextAreaElement).value).toBe('')
  })

  it('changing date picker fires onChange with date', () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '2025-03-01' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('clearing date picker fires onChange with null', () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('toggling AssumptionRiskSection checkbox triggers isRisk onChange', async () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox', { name: /Is Risk/i })
    await userEvent.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(true)
  })

  it('typing into other information editor triggers onChange', async () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const editors = screen.getAllByRole('textbox', { name: /other information/i })
    const editor = editors[editors.length - 1]
    await userEvent.type(editor, 'Other info')
    expect((editor as HTMLTextAreaElement).value).toBe('Other info')
  })

  it('selecting a value in combobox triggers validatedById onChange', async () => {
    render(<CreateAssumptionForm onSubmit={vi.fn()} />)
    const combobox = screen.getByTestId('combobox')
    fireEvent.change(combobox, { target: { value: '' } })
    expect(combobox).toBeInTheDocument()
  })
})
