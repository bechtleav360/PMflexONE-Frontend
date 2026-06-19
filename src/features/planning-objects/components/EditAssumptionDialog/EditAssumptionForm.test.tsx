/* eslint-disable max-lines -- test file; many independent branch-coverage cases per conditional */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { AssumptionListItem } from '../../types/assumption.types'
import { EditAssumptionForm } from './EditAssumptionForm'

vi.mock('@/entities/person', () => ({
  usePersons: () => ({ data: [], isLoading: false }),
}))

vi.mock('../AssumptionLinksSection', () => ({
  AssumptionLinksSection: () => <div data-testid="assumption-links-section" />,
}))

vi.mock('../AssumptionRiskSection', () => ({
  AssumptionRiskSection: ({
    isRisk,
    onIsRiskChange,
  }: {
    isRisk: boolean
    onIsRiskChange: (v: boolean) => void
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
    DatePicker: ({ onChange }: { onChange: (d: Date | null) => void }) => (
      <input
        type="date"
        data-testid="date-picker"
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      />
    ),
    Combobox: ({ onChange }: { onChange: (v: string | null) => void; options: unknown[] }) => (
      <select
        data-testid="combobox"
        onChange={(e) => onChange(e.target.value || null)}
      />
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

function makeAssumption(overrides: Partial<AssumptionListItem> = {}): AssumptionListItem {
  return {
    id: 'a-1',
    version: 1,
    name: 'Test Assumption',
    description: null,
    dueDate: null,
    validationStatus: 'OPEN',
    isRisk: false,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    relatedRisks: [],
    projectCharter: null,
    ...overrides,
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases covering branches
describe('EditAssumptionForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(container.querySelector('#edit-assumption-form')).toBeInTheDocument()
  })

  it('pre-populates name field', () => {
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption({ name: 'My Assumption' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(container.querySelector('#edit-assumption-name')).toHaveValue('My Assumption')
  })

  it('shows validation error when name is cleared and form submitted', async () => {
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption({ name: 'x' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    const nameInput = container.querySelector('#edit-assumption-name')!
    await userEvent.clear(nameInput)
    fireEvent.submit(container.querySelector('#edit-assumption-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('calls onSubmit with updated name when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption({ name: 'Old' })}
        scopeId="proj-1"
        onSubmit={onSubmit}
      />,
    )
    const nameInput = container.querySelector('#edit-assumption-name')!
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'New Name')
    fireEvent.submit(container.querySelector('#edit-assumption-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'New Name' })
  })

  it('hides description when readOnly and description is null', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ description: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('shows description when readOnly and description has value', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ description: 'Some desc' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows description when not readOnly', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ description: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('hides date picker when readOnly and dueDate is null', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ dueDate: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument()
  })

  it('shows date picker when readOnly and dueDate has value', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ dueDate: '2024-12-31' })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('shows date picker when not readOnly', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ dueDate: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('hides risk section when readOnly, isRisk false, and linkedRisk null', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ isRisk: false, linkedRisk: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByTestId('assumption-risk-section')).not.toBeInTheDocument()
  })

  it('shows risk section when readOnly and isRisk is true', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ isRisk: true })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByTestId('assumption-risk-section')).toBeInTheDocument()
  })

  it('shows risk section when readOnly and linkedRisk present', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ linkedRisk: { id: 'r-1', name: 'Risk', status: 'OPEN' } })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByTestId('assumption-risk-section')).toBeInTheDocument()
  })

  it('shows risk section when not readOnly', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ isRisk: false, linkedRisk: null })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByTestId('assumption-risk-section')).toBeInTheDocument()
  })

  it('hides links section when readOnly, no projectCharter, no relatedRisks', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({ projectCharter: null, relatedRisks: [] })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByTestId('assumption-links-section')).not.toBeInTheDocument()
  })

  it('shows links section when readOnly and projectCharter present', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption({
          projectCharter: { id: 'pc-1', status: 'ACTIVE' },
        })}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByTestId('assumption-links-section')).toBeInTheDocument()
  })

  it('shows links section when not readOnly', () => {
    render(
      <EditAssumptionForm
        assumption={makeAssumption()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByTestId('assumption-links-section')).toBeInTheDocument()
  })

  it('calls onDirtyChange when name changes', async () => {
    const onDirtyChange = vi.fn()
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        onDirtyChange={onDirtyChange}
      />,
    )
    await userEvent.type(container.querySelector('#edit-assumption-name')!, 'x')
    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('disables name input when readOnly', () => {
    const { container } = render(
      <EditAssumptionForm
        assumption={makeAssumption()}
        scopeId="proj-1"
        onSubmit={vi.fn()}
        readOnly
      />,
    )
    expect(container.querySelector('#edit-assumption-name')).toBeDisabled()
  })
})
