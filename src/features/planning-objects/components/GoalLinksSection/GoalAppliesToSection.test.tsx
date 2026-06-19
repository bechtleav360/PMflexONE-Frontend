import { useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GoalDetail, GoalListItem } from '../../types/goal.types'
import { GoalAppliesToSection } from './GoalAppliesToSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.name === 'string') return `${key}:${opts.name}`
      return key
    },
  }),
}))

const baseGoal: GoalDetail = {
  id: 'g-1',
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
  scope: { id: 'proj-1', scopeType: 'Project' },
  parentLevelGoalName: null,
  parentLevelGoal: null,
  relatedGoals: [],
  linkedRequirements: [],
  businessCase: null,
  projectCharter: null,
  initiationRequests: [],
}

const programGoals = [{ id: 'pg-1', name: 'Program Goal Alpha' }] as unknown as GoalListItem[]
const portfolioGoals = [{ id: 'po-1', name: 'Portfolio Goal Beta' }] as unknown as GoalListItem[]

function AppliesToWrapper(initialProps: Parameters<typeof GoalAppliesToSection>[0]) {
  const [pendingParentGoalId, setPendingParentGoalId] = useState(initialProps.pendingParentGoalId)
  const [pendingClearParentGoal, setPendingClearParentGoal] = useState(
    initialProps.pendingClearParentGoal,
  )
  return (
    <GoalAppliesToSection
      {...initialProps}
      pendingParentGoalId={pendingParentGoalId}
      setPendingParentGoalId={setPendingParentGoalId}
      pendingClearParentGoal={pendingClearParentGoal}
      setPendingClearParentGoal={setPendingClearParentGoal}
    />
  )
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('GoalAppliesToSection', () => {
  it('returns null in readOnly mode when no parent goal and no staged goal', () => {
    const { container } = render(
      <GoalAppliesToSection
        goalDetail={baseGoal}
        programGoals={[]}
        portfolioGoals={[]}
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows persisted parent goal badge', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      parentLevelGoal: { id: 'pg-1', name: 'Program Goal Alpha' },
    }
    render(
      <GoalAppliesToSection
        goalDetail={goal}
        programGoals={[]}
        portfolioGoals={[]}
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Program Goal Alpha')).toBeInTheDocument()
  })

  it('shows deleted badge when parentLevelGoal is null but name exists', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      parentLevelGoalName: 'Deleted Goal',
      parentLevelGoal: null,
    }
    render(
      <GoalAppliesToSection
        goalDetail={goal}
        programGoals={[]}
        portfolioGoals={[]}
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Deleted Goal')).toBeInTheDocument()
    expect(
      screen.getByText('features.planningObjects.goals.parentLevelGoalDeleted'),
    ).toBeInTheDocument()
  })

  it('clicking remove on persisted badge stages clear', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      parentLevelGoal: { id: 'pg-1', name: 'Program Goal Alpha' },
    }
    render(
      <AppliesToWrapper
        goalDetail={goal}
        programGoals={programGoals}
        portfolioGoals={[]}
        programId="prog-1"
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Program Goal Alpha')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Program Goal Alpha'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Program Goal Alpha')).not.toBeInTheDocument()
  })

  it('shows staged parent goal badge when pendingParentGoalId is set', () => {
    render(
      <GoalAppliesToSection
        goalDetail={baseGoal}
        programGoals={programGoals}
        portfolioGoals={[]}
        programId="prog-1"
        pendingParentGoalId="pg-1"
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Program Goal Alpha')).toBeInTheDocument()
  })

  it('clicking remove on staged badge calls setPendingParentGoalId(null)', async () => {
    render(
      <AppliesToWrapper
        goalDetail={baseGoal}
        programGoals={programGoals}
        portfolioGoals={[]}
        programId="prog-1"
        pendingParentGoalId="pg-1"
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Program Goal Alpha')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Program Goal Alpha'))
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Program Goal Alpha')).not.toBeInTheDocument()
  })

  it('shows combobox when programId provided and no parent selected', () => {
    render(
      <GoalAppliesToSection
        goalDetail={baseGoal}
        programGoals={programGoals}
        portfolioGoals={portfolioGoals}
        programId="prog-1"
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('hides combobox when pendingParentGoalId is set', () => {
    render(
      <GoalAppliesToSection
        goalDetail={baseGoal}
        programGoals={programGoals}
        portfolioGoals={[]}
        programId="prog-1"
        pendingParentGoalId="pg-1"
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('combobox options include both program and portfolio goals', async () => {
    render(
      <GoalAppliesToSection
        goalDetail={baseGoal}
        programGoals={programGoals}
        portfolioGoals={portfolioGoals}
        programId="prog-1"
        portfolioId="port-1"
        pendingParentGoalId={null}
        setPendingParentGoalId={vi.fn()}
        pendingClearParentGoal={false}
        setPendingClearParentGoal={vi.fn()}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByRole('option', { name: /Program Goal Alpha/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Portfolio Goal Beta/ })).toBeInTheDocument()
  })
})
