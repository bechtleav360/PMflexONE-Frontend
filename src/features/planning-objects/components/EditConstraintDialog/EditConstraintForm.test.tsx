/* eslint-disable max-lines -- test file; many independent branch-coverage cases per conditional */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { ConstraintListItem } from '../../types/constraint.types'
import { EditConstraintForm } from './EditConstraintForm'

vi.mock('../ConstraintLinksSection', () => ({
  ConstraintLinksSection: () => <div data-testid="constraint-links-section" />,
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
    DatePicker: ({ onChange }: { onChange: (d: Date | null) => void }) => (
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
  }
})

function makeConstraint(overrides: Partial<ConstraintListItem> = {}): ConstraintListItem {
  return {
    id: 'c-1',
    version: 1,
    name: 'Test Constraint',
    description: null,
    timeConstrained: false,
    dueDate: null,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    ...overrides,
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases covering branches
describe('EditConstraintForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(container.querySelector('#edit-constraint-form')).toBeInTheDocument()
  })

  it('pre-populates name field', () => {
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint({ name: 'My Constraint' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(container.querySelector('#edit-constraint-name')).toHaveValue('My Constraint')
  })

  it('shows validation error when name is cleared and form submitted', async () => {
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    await userEvent.clear(container.querySelector('#edit-constraint-name')!)
    fireEvent.submit(container.querySelector('#edit-constraint-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={onSubmit}
      />,
    )
    fireEvent.submit(container.querySelector('#edit-constraint-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  })

  it('hides description when readOnly and description is null', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ description: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('shows description when readOnly and description has value', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ description: 'Some desc' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows description when not readOnly', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('hides time-constrained checkbox when readOnly and timeConstrained is false', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: false })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('shows time-constrained checkbox when readOnly and timeConstrained is true', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: true })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('shows time-constrained checkbox when not readOnly', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('hides date picker when timeConstrained is false', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: false })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument()
  })

  it('shows date picker when timeConstrained is true', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: true })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('shows date picker after checking time-constrained', async () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: false })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('hides date picker after unchecking time-constrained', async () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ timeConstrained: true })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument()
  })

  it('shows owner when constraint has owner', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({
          owner: { id: 'u-1', firstName: 'Jane', lastName: 'Doe', mail: 'jane@example.com' },
        })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('hides owner section when owner is null', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ owner: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByText(/Jane/)).not.toBeInTheDocument()
  })

  it('hides links section when readOnly and no projectCharter', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({ projectCharter: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByTestId('constraint-links-section')).not.toBeInTheDocument()
  })

  it('shows links section when readOnly and projectCharter present', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint({
          projectCharter: { id: 'pc-1', status: 'ACTIVE' },
        })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByTestId('constraint-links-section')).toBeInTheDocument()
  })

  it('shows links section when not readOnly', () => {
    render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByTestId('constraint-links-section')).toBeInTheDocument()
  })

  it('calls onDirtyChange when name changes', async () => {
    const onDirtyChange = vi.fn()
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
      />,
    )
    await userEvent.type(container.querySelector('#edit-constraint-name')!, 'x')
    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('disables name input when readOnly', () => {
    const { container } = render(
      <EditConstraintForm
        constraint={makeConstraint()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(container.querySelector('#edit-constraint-name')).toBeDisabled()
  })
})
