import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { GoalListItem } from '../../types/goal.types'
import { GoalTreeRow } from './GoalTreeRow'

vi.mock('../GoalProgressBar', () => ({
  GoalProgressBar: ({ value }: { value: number }) => (
    <div data-testid="goal-progress-bar">{value}</div>
  ),
}))

const mockOnView = vi.fn()
const mockOnEdit = vi.fn()
const mockOnAddChild = vi.fn()
const mockOnAddSibling = vi.fn()
const mockOnDelete = vi.fn()

vi.mock('./GoalTreeRowActions', () => ({
  GoalTreeRowActions: (props: {
    goalId: string
    onView?: (id: string) => void
    onEdit?: (id: string) => void
    onAddChild?: (id: string) => void
    onAddSibling?: (id: string) => void
    onDelete?: (id: string) => void
  }) => (
    /* eslint-disable react/jsx-no-literals -- test mock labels; not user-facing */
    <div data-testid="goal-row-actions">
      {props.onView && <button onClick={() => props.onView!(props.goalId)}>View</button>}
      {props.onEdit && <button onClick={() => props.onEdit!(props.goalId)}>Edit</button>}
      {props.onAddChild && (
        <button onClick={() => props.onAddChild!(props.goalId)}>AddChild</button>
      )}
      {props.onAddSibling && (
        <button onClick={() => props.onAddSibling!(props.goalId)}>AddSibling</button>
      )}
      {props.onDelete && <button onClick={() => props.onDelete!(props.goalId)}>Delete</button>}
    </div>
    /* eslint-enable react/jsx-no-literals */
  ),
}))

function makeGoal(overrides: Partial<GoalListItem> = {}): GoalListItem {
  return {
    id: 'goal-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Goal',
    description: null,
    progress: 42,
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
    scope: { id: 'proj-1', scopeType: 'Project' },
    parentLevelGoalName: null,
    ...overrides,
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('GoalTreeRow', () => {
  it('renders goal name', () => {
    render(<GoalTreeRow goal={makeGoal({ name: 'My Goal' })} />)
    expect(screen.getByText('My Goal')).toBeInTheDocument()
  })

  it('passes progress value to GoalProgressBar', () => {
    render(<GoalTreeRow goal={makeGoal({ progress: 75 })} />)
    expect(screen.getByTestId('goal-progress-bar')).toHaveTextContent('75')
  })

  it('calls onView with goal id', async () => {
    render(
      <GoalTreeRow
        goal={makeGoal()}
        onView={mockOnView}
      />,
    )
    await userEvent.click(screen.getByText('View'))
    expect(mockOnView).toHaveBeenCalledWith('goal-1')
  })

  it('calls onEdit with goal id', async () => {
    render(
      <GoalTreeRow
        goal={makeGoal()}
        onEdit={mockOnEdit}
      />,
    )
    await userEvent.click(screen.getByText('Edit'))
    expect(mockOnEdit).toHaveBeenCalledWith('goal-1')
  })

  it('calls onAddChild with goal id', async () => {
    render(
      <GoalTreeRow
        goal={makeGoal()}
        onAddChild={mockOnAddChild}
      />,
    )
    await userEvent.click(screen.getByText('AddChild'))
    expect(mockOnAddChild).toHaveBeenCalledWith('goal-1')
  })

  it('calls onAddSibling with goal id', async () => {
    render(
      <GoalTreeRow
        goal={makeGoal()}
        onAddSibling={mockOnAddSibling}
      />,
    )
    await userEvent.click(screen.getByText('AddSibling'))
    expect(mockOnAddSibling).toHaveBeenCalledWith('goal-1')
  })

  it('calls onDelete with goal id', async () => {
    render(
      <GoalTreeRow
        goal={makeGoal()}
        onDelete={mockOnDelete}
      />,
    )
    await userEvent.click(screen.getByText('Delete'))
    expect(mockOnDelete).toHaveBeenCalledWith('goal-1')
  })

  it('omits actions when no callbacks provided', () => {
    render(<GoalTreeRow goal={makeGoal()} />)
    expect(screen.queryByText('View')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
})
