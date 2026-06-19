import { useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GoalDetail } from '../../types/goal.types'
import type { RequirementListItem } from '../../types/requirement.types'
import { GoalLinkedRequirementsSection } from './GoalLinkedRequirementsSection'

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

const scopeRequirements = [
  {
    id: 'req-1',
    version: 1,
    sortOrder: 0,
    name: 'Requirement Alpha',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'NEW',
    scope: { id: 'proj-1', scopeType: 'Project' },
    parent: null,
    creator: null,
  },
  {
    id: 'req-2',
    version: 1,
    sortOrder: 1,
    name: 'Requirement Beta',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'SHOULD_HAVE',
    status: 'NEW',
    scope: { id: 'proj-1', scopeType: 'Project' },
    parent: null,
    creator: null,
  },
] as unknown as RequirementListItem[]

function LinkedRequirementsWrapper(
  initialProps: Parameters<typeof GoalLinkedRequirementsSection>[0],
) {
  const [pendingLinkIds, setPendingLinkIds] = useState(initialProps.pendingLinkIds)
  const [pendingUnlinkIds, setPendingUnlinkIds] = useState(initialProps.pendingUnlinkIds)
  return (
    <GoalLinkedRequirementsSection
      {...initialProps}
      pendingLinkIds={pendingLinkIds}
      setPendingLinkIds={setPendingLinkIds}
      pendingUnlinkIds={pendingUnlinkIds}
      setPendingUnlinkIds={setPendingUnlinkIds}
    />
  )
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('GoalLinkedRequirementsSection', () => {
  it('returns null in readOnly mode when no requirements', () => {
    const { container } = render(
      <GoalLinkedRequirementsSection
        goalDetail={baseGoal}
        scopeRequirements={[]}
        pendingLinkIds={new Set()}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows persisted linked requirements as badges', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      linkedRequirements: [{ id: 'req-1', name: 'Requirement Alpha', status: 'NEW' }],
    }
    render(
      <GoalLinkedRequirementsSection
        goalDetail={goal}
        scopeRequirements={scopeRequirements}
        pendingLinkIds={new Set()}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Requirement Alpha')).toBeInTheDocument()
  })

  it('clicking remove on persisted badge stages unlink — badge disappears', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      linkedRequirements: [{ id: 'req-1', name: 'Requirement Alpha', status: 'NEW' }],
    }
    render(
      <LinkedRequirementsWrapper
        goalDetail={goal}
        scopeRequirements={scopeRequirements}
        pendingLinkIds={new Set()}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Requirement Alpha'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Requirement Alpha')).not.toBeInTheDocument()
  })

  it('staged requirements shown as outline badges', () => {
    render(
      <GoalLinkedRequirementsSection
        goalDetail={baseGoal}
        scopeRequirements={scopeRequirements}
        pendingLinkIds={new Set(['req-1'])}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Requirement Alpha')).toBeInTheDocument()
  })

  it('clicking remove on staged badge removes it', async () => {
    render(
      <LinkedRequirementsWrapper
        goalDetail={baseGoal}
        scopeRequirements={scopeRequirements}
        pendingLinkIds={new Set(['req-1'])}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByText('Requirement Alpha')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Requirement Alpha'))
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Requirement Alpha')).not.toBeInTheDocument()
  })

  it('combobox options exclude already-linked and already-staged requirements', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      linkedRequirements: [{ id: 'req-1', name: 'Requirement Alpha', status: 'NEW' }],
    }
    const extended = [
      ...scopeRequirements,
      {
        id: 'req-3',
        version: 1,
        sortOrder: 2,
        name: 'Requirement Gamma',
        requirementScope: 'IN_SCOPE',
        source: 'INTERNAL',
        estimatedEffortMin: null,
        estimatedEffortMax: null,
        type: 'FUNCTIONAL',
        priority: 'MUST_HAVE',
        status: 'NEW',
        scope: { id: 'proj-1', scopeType: 'Project' },
        parent: null,
        creator: null,
      },
    ] as unknown as RequirementListItem[]
    render(
      <GoalLinkedRequirementsSection
        goalDetail={goal}
        scopeRequirements={extended}
        pendingLinkIds={new Set(['req-2'])}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const options = await screen.findAllByRole('option')
    const texts = options.map((o) => o.textContent)
    expect(texts).toContain('Requirement Gamma')
    expect(texts).not.toContain('Requirement Alpha')
    expect(texts).not.toContain('Requirement Beta')
  })

  it('shows combobox in edit mode', () => {
    render(
      <GoalLinkedRequirementsSection
        goalDetail={baseGoal}
        scopeRequirements={scopeRequirements}
        pendingLinkIds={new Set()}
        setPendingLinkIds={vi.fn()}
        pendingUnlinkIds={new Set()}
        setPendingUnlinkIds={vi.fn()}
        readOnly={false}
      />,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
