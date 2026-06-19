import { useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GoalDetail, GoalListItem } from '../../types/goal.types'
import { GoalRelatedGoalsSection } from './GoalRelatedGoalsSection'

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

const scopeGoals = [
  { id: 'g-2', name: 'Scope Goal B' },
  { id: 'g-3', name: 'Scope Goal C' },
] as unknown as GoalListItem[]

function RelatedGoalsWrapper(initialProps: Parameters<typeof GoalRelatedGoalsSection>[0]) {
  const [pendingGoalLinks, setPendingGoalLinks] = useState(initialProps.pendingGoalLinks)
  const [pendingGoalUnlinks, setPendingGoalUnlinks] = useState(initialProps.pendingGoalUnlinks)
  return (
    <GoalRelatedGoalsSection
      {...initialProps}
      pendingGoalLinks={pendingGoalLinks}
      setPendingGoalLinks={setPendingGoalLinks}
      pendingGoalUnlinks={pendingGoalUnlinks}
      setPendingGoalUnlinks={setPendingGoalUnlinks}
    />
  )
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('GoalRelatedGoalsSection', () => {
  it('returns null in readOnly mode when no related goals', () => {
    const { container } = render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={baseGoal}
        scopeGoals={[]}
        pendingGoalLinks={new Set()}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows persisted related goals as secondary badges', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Scope Goal B' }],
    }
    render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={goal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set()}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Scope Goal B')).toBeInTheDocument()
  })

  it('clicking remove on persisted badge stages unlink — badge disappears', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Scope Goal B' }],
    }
    render(
      <RelatedGoalsWrapper
        goalId="g-1"
        goalDetail={goal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set()}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Scope Goal B'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Scope Goal B')).not.toBeInTheDocument()
  })

  it('staged goals shown as outline badges', () => {
    render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={baseGoal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set(['g-2'])}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Scope Goal B')).toBeInTheDocument()
  })

  it('clicking remove on staged badge removes it', async () => {
    render(
      <RelatedGoalsWrapper
        goalId="g-1"
        goalDetail={baseGoal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set(['g-2'])}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Scope Goal B')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Scope Goal B'))
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Scope Goal B')).not.toBeInTheDocument()
  })

  it('combobox options exclude goalId, persisted goals, and staged goals', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Scope Goal B' }],
    }
    const extendedScope = [
      { id: 'g-1', name: 'Test Goal' },
      { id: 'g-2', name: 'Scope Goal B' },
      { id: 'g-3', name: 'Scope Goal C' },
      { id: 'g-4', name: 'Scope Goal D' },
    ] as unknown as GoalListItem[]
    render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={goal}
        scopeGoals={extendedScope}
        pendingGoalLinks={new Set(['g-4'])}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const options = await screen.findAllByRole('option')
    const optionTexts = options.map((o) => o.textContent)
    expect(optionTexts).toContain('Scope Goal C')
    expect(optionTexts).not.toContain('Test Goal')
    expect(optionTexts).not.toContain('Scope Goal B')
    expect(optionTexts).not.toContain('Scope Goal D')
  })

  it('shows combobox in edit mode', () => {
    render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={baseGoal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set()}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('hides combobox in readOnly mode when goals exist', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Scope Goal B' }],
    }
    render(
      <GoalRelatedGoalsSection
        goalId="g-1"
        goalDetail={goal}
        scopeGoals={scopeGoals}
        pendingGoalLinks={new Set()}
        setPendingGoalLinks={vi.fn()}
        pendingGoalUnlinks={new Set()}
        setPendingGoalUnlinks={vi.fn()}
        readOnly
      />,
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
