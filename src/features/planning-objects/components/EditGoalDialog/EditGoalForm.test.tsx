/* eslint-disable max-lines -- test file; many independent branch-coverage cases per conditional */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { GoalDetail } from '../../types/goal.types'
import { EditGoalForm } from './EditGoalForm'

vi.mock('@/entities/person', () => ({
  usePersons: () => ({ data: [], isLoading: false }),
}))

vi.mock('../GoalLinksSection', () => ({
  GoalLinksSection: () => <div data-testid="goal-links-section" />,
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
    DatePicker: ({ onChange, id }: { onChange: (d: Date | null) => void; id?: string }) => (
      <input
        type="date"
        id={id}
        data-testid={id ?? 'date-picker'}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      />
    ),
    Combobox: ({
      onChange,
      id,
    }: {
      value: string | null
      onChange: (v: string | null) => void
      options: unknown[]
      id?: string
    }) => (
      <select
        data-testid={id ?? 'combobox'}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="" />
        {/* eslint-disable-next-line react/jsx-no-literals -- test mock option label; not user-facing */}
        <option value="person-1">Person One</option>
      </select>
    ),
  }
})

function makeGoalDetail(overrides: Partial<GoalDetail> = {}): GoalDetail {
  return {
    id: 'goal-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Goal',
    description: null,
    progress: 0,
    dueDate: null,
    keyResults: null,
    impact: null,
    outcome: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    children: [],
    parentLevelGoalName: null,
    relatedGoals: [],
    linkedRequirements: [],
    businessCase: null,
    projectCharter: null,
    initiationRequests: [],
    parentLevelGoal: null,
    ...overrides,
  }
}

const defaultProps = {
  scopeType: 'Project' as const,
  scopeId: 'proj-1',
  showAppliesTo: false,
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases covering branches
describe('EditGoalForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(container.querySelector('#edit-goal-form')).toBeInTheDocument()
  })

  it('pre-populates name field', () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ name: 'My Goal' })}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(container.querySelector('#edit-goal-name')).toHaveValue('My Goal')
  })

  it('shows validation error when name is cleared and form submitted', async () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    await userEvent.clear(container.querySelector('#edit-goal-name')!)
    fireEvent.submit(container.querySelector('#edit-goal-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={onSubmit}
        {...defaultProps}
      />,
    )
    fireEvent.submit(container.querySelector('#edit-goal-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  })

  it('progress slider is enabled for leaf goal (no children)', () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ children: [] })}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(container.querySelector('#edit-goal-progress')).not.toBeDisabled()
  })

  it('progress slider is disabled for non-leaf goal (has children)', () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ children: [{ id: 'child-1' }] })}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(container.querySelector('#edit-goal-progress')).toBeDisabled()
  })

  it('hides description when readOnly and description is null', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ description: null })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('shows description when readOnly and description has value', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ description: 'Some desc' })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('hides due date when readOnly and dueDate is null', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ dueDate: null })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.queryByTestId('edit-goal-due-date')).not.toBeInTheDocument()
  })

  it('shows due date when readOnly and dueDate has value', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ dueDate: '2025-01-01' })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.getByTestId('edit-goal-due-date')).toBeInTheDocument()
  })

  it('hides acceptedBy combobox when readOnly and acceptedBy is null', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ acceptedBy: null })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.queryByTestId('edit-goal-accepted-by')).not.toBeInTheDocument()
  })

  it('shows acceptedBy combobox when not readOnly', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(screen.getByTestId('edit-goal-accepted-by')).toBeInTheDocument()
  })

  it('hides acceptedAt date picker when not readOnly and acceptedById is empty', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ acceptedBy: null, acceptedAt: null })}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(screen.queryByTestId('edit-goal-accepted-at')).not.toBeInTheDocument()
  })

  it('shows acceptedAt date picker when readOnly and acceptedAt has value', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({
          acceptedBy: { id: 'p-1', firstName: 'Jane', lastName: 'Doe', mail: 'jane@example.com' },
          acceptedAt: '2024-06-01',
        })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.getByTestId('edit-goal-accepted-at')).toBeInTheDocument()
  })

  it('auto-shows acceptedAt date picker when acceptedBy is selected', async () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({ acceptedBy: null, acceptedAt: null })}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(screen.queryByTestId('edit-goal-accepted-at')).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByTestId('edit-goal-accepted-by'), 'person-1')
    expect(screen.getByTestId('edit-goal-accepted-at')).toBeInTheDocument()
  })

  it('hides links section when readOnly and no linked entities', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.queryByTestId('goal-links-section')).not.toBeInTheDocument()
  })

  it('shows links section when not readOnly', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
      />,
    )
    expect(screen.getByTestId('goal-links-section')).toBeInTheDocument()
  })

  it('shows links section when readOnly and projectCharter present', () => {
    render(
      <EditGoalForm
        goalDetail={makeGoalDetail({
          projectCharter: { id: 'pc-1', status: 'ACTIVE' },
        })}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(screen.getByTestId('goal-links-section')).toBeInTheDocument()
  })

  it('calls onDirtyChange when name changes', async () => {
    const onDirtyChange = vi.fn()
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
        onDirtyChange={onDirtyChange}
      />,
    )
    await userEvent.type(container.querySelector('#edit-goal-name')!, 'x')
    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('disables name input when readOnly', () => {
    const { container } = render(
      <EditGoalForm
        goalDetail={makeGoalDetail()}
        onSubmit={vi.fn()}
        {...defaultProps}
        readOnly
      />,
    )
    expect(container.querySelector('#edit-goal-name')).toBeDisabled()
  })
})
