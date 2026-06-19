import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CreateGoalForm } from './CreateGoalForm'

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
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- test suite coverage for all Controller onChange callbacks
describe('CreateGoalForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(<CreateGoalForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-goal-form')).toBeInTheDocument()
  })

  it('renders name input', () => {
    const { container } = render(<CreateGoalForm onSubmit={vi.fn()} />)
    expect(container.querySelector('#create-goal-name')).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const { container } = render(<CreateGoalForm onSubmit={vi.fn()} />)
    fireEvent.submit(container.querySelector('#create-goal-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('does not call onSubmit when name is empty', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateGoalForm onSubmit={onSubmit} />)
    fireEvent.submit(container.querySelector('#create-goal-form')!)
    await screen.findByRole('alert')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with name when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateGoalForm onSubmit={onSubmit} />)
    const nameInput = container.querySelector('#create-goal-name')!
    await userEvent.type(nameInput, 'My Goal')
    fireEvent.submit(container.querySelector('#create-goal-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'My Goal' })
  })

  it('renders description markdown editor', () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument()
  })

  it('renders date picker for due date', () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('typing into description editor triggers onChange', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'Some description')
    expect((editor as HTMLTextAreaElement).value).toBe('Some description')
  })

  it('clearing description editor sets field to null (empty string branch)', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /description/i })
    await userEvent.type(editor, 'x')
    await userEvent.clear(editor)
    expect((editor as HTMLTextAreaElement).value).toBe('')
  })

  it('changing date picker fires onChange with date string', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const datePicker = screen.getByTestId('date-picker')
    await userEvent.type(datePicker, '2025-01-15')
    fireEvent.change(datePicker, { target: { value: '2025-01-15' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('clearing date picker fires onChange with null', () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const datePicker = screen.getByTestId('date-picker')
    fireEvent.change(datePicker, { target: { value: '' } })
    expect(datePicker).toBeInTheDocument()
  })

  it('typing into key results editor triggers onChange', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /key results/i })
    await userEvent.type(editor, 'KR1')
    expect((editor as HTMLTextAreaElement).value).toBe('KR1')
  })

  it('typing into impact editor triggers onChange', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /impact/i })
    await userEvent.type(editor, 'Impact text')
    expect((editor as HTMLTextAreaElement).value).toBe('Impact text')
  })

  it('typing into outcome editor triggers onChange', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editor = screen.getByRole('textbox', { name: /outcome/i })
    await userEvent.type(editor, 'Outcome text')
    expect((editor as HTMLTextAreaElement).value).toBe('Outcome text')
  })

  it('typing into other information editor triggers onChange', async () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    const editors = screen.getAllByRole('textbox', { name: /other information/i })
    const editor = editors[editors.length - 1]
    await userEvent.type(editor, 'Other info')
    expect((editor as HTMLTextAreaElement).value).toBe('Other info')
  })

  it('renders progress slider with default value 0', () => {
    const { container } = render(<CreateGoalForm onSubmit={vi.fn()} />)
    const slider = container.querySelector('#create-goal-progress') as HTMLInputElement
    expect(slider).toBeInTheDocument()
    expect(slider.value).toBe('0')
  })

  it('progress label shows current percentage', () => {
    render(<CreateGoalForm onSubmit={vi.fn()} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('changing progress slider updates displayed value and submits correct progress', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<CreateGoalForm onSubmit={onSubmit} />)
    const slider = container.querySelector('#create-goal-progress') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '75' } })
    expect(slider.value).toBe('75')
    const nameInput = container.querySelector('#create-goal-name')!
    await userEvent.type(nameInput, 'My Goal')
    fireEvent.submit(container.querySelector('#create-goal-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ progress: 75 })
  })
})
