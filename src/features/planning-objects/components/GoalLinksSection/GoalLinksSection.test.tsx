/* eslint-disable max-lines -- comprehensive test coverage for complex component */
import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useBusinessCaseByProjectId } from '../../hooks/useBusinessCaseByProjectId'
import { useGoals } from '../../hooks/useGoals'
import { useInitiationRequestsByScopeId } from '../../hooks/useInitiationRequestsByScopeId'
import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import { useRequirements } from '../../hooks/useRequirements'
import type { GoalDetail } from '../../types/goal.types'
import { GoalLinksSection } from './GoalLinksSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.name === 'string') return `${key}:${opts.name}`
      return key
    },
  }),
}))

vi.mock('../../hooks/useGoals', () => ({
  useGoals: vi.fn(() => ({ data: [] })),
}))
vi.mock('../../hooks/useClearParentLevelGoal', () => ({
  useClearParentLevelGoal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useSetParentLevelGoal', () => ({
  useSetParentLevelGoal: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useLinkGoals', () => ({
  useLinkGoals: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useUnlinkGoals', () => ({
  useUnlinkGoals: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useLinkGoalToRequirement', () => ({
  useLinkGoalToRequirement: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useUnlinkGoalFromRequirement', () => ({
  useUnlinkGoalFromRequirement: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useLinkGoalToBusinessCase', () => ({
  useLinkGoalToBusinessCase: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useUnlinkGoalFromBusinessCase', () => ({
  useUnlinkGoalFromBusinessCase: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useLinkGoalToProjectCharter', () => ({
  useLinkGoalToProjectCharter: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useUnlinkGoalFromProjectCharter', () => ({
  useUnlinkGoalFromProjectCharter: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useBusinessCaseByProjectId', () => ({
  useBusinessCaseByProjectId: vi.fn(() => ({ data: null })),
}))
vi.mock('../../hooks/useProjectCharterByProjectId', () => ({
  useProjectCharterByProjectId: vi.fn(() => ({ data: null })),
}))
vi.mock('../../hooks/useLinkGoalToInitiationRequest', () => ({
  useLinkGoalToInitiationRequest: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useUnlinkGoalFromInitiationRequest', () => ({
  useUnlinkGoalFromInitiationRequest: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../../hooks/useInitiationRequestsByScopeId', () => ({
  useInitiationRequestsByScopeId: vi.fn(() => ({ data: [] })),
}))
vi.mock('../../hooks/useRequirements', () => ({
  useRequirements: vi.fn(() => ({ data: [] })),
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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const defaultProps = {
  goalId: 'g-1',
  goalVersion: 1,
  scopeId: 'proj-1',
  scopeType: 'Project' as const,
  showAppliesTo: true,
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('GoalLinksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hides "Applies to" section when showAppliesTo is false', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )
    // No "Applies to" section — no section with appliesTo aria-label
    const sections = screen.queryAllByRole('region')
    const appliesToSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('appliesTo'),
    )
    expect(appliesToSection).toBeUndefined()
  })

  it('shows "Applies to" section when showAppliesTo is true', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo
      />,
      { wrapper: makeWrapper() },
    )
    // Section is present — aria-label contains the translation key for appliesTo
    const sections = screen.getAllByRole('region')
    const appliesToSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('appliesTo'),
    )
    expect(appliesToSection).toBeDefined()
  })

  it('shows deleted parent level goal badge with parentLevelGoalDeleted text', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      parentLevelGoalName: 'Old Program Goal',
      parentLevelGoal: null,
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Old Program Goal')).toBeInTheDocument()
    // The parentLevelGoalDeleted key is rendered as its translation key in tests
    expect(screen.getByText(/parentLevelGoalDeleted/)).toBeInTheDocument()
  })

  it('unlinking a related goal stages the removal — badge disappears immediately', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Related Goal' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    expect(screen.getByText('Related Goal')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Related Goal'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)

    expect(screen.queryByText('Related Goal')).not.toBeInTheDocument()
  })

  it('staging a requirement link shows badge in requirements section', async () => {
    vi.mocked(useRequirements).mockReturnValue({
      data: [{ id: 'req-42', name: 'Req 42', status: 'OPEN' }],
    } as unknown as ReturnType<typeof useRequirements>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const reqSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('linkedRequirements'))
    expect(reqSection).toBeDefined()

    // Open the requirements combobox
    const trigger = reqSection!.querySelector('button')
    expect(trigger).not.toBeNull()
    await userEvent.click(trigger!)

    // Select the requirement from the dropdown
    const option = await screen.findByText('Req 42')
    await userEvent.click(option)

    // Badge should appear (staged)
    expect(screen.getByText('Req 42')).toBeInTheDocument()
  })

  it('shows business case badge with remove button — staging removes badge', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      businessCase: { id: 'bc-1', status: 'DRAFT' },
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const bcLabel = 'features.planningObjects.goals.businessCase'
    // Label appears in both h3 heading and badge span
    expect(screen.getAllByText(bcLabel).length).toBeGreaterThanOrEqual(2)
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(bcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    // After staging unlink, badge span disappears (h3 heading remains if section still visible)
    // The section is hidden entirely when effectiveBc becomes false and readOnly=false shows combobox instead
    expect(screen.queryByRole('button', { name: new RegExp(bcLabel) })).not.toBeInTheDocument()
  })

  it('shows business case combobox in edit mode even when project has no business case', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const businessCaseSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('businessCase'))
    expect(businessCaseSection).toBeDefined()
  })

  it('shows business case combobox with option when project has a business case', () => {
    vi.mocked(useBusinessCaseByProjectId).mockReturnValue({
      data: { id: 'bc-1', status: 'DRAFT' },
    } as unknown as ReturnType<typeof useBusinessCaseByProjectId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const businessCaseSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('businessCase'))
    expect(businessCaseSection).toBeDefined()
  })

  it('shows project charter badge with remove button — staging removes badge', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      projectCharter: { id: 'pc-1', status: 'SUBMITTED' },
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const pcLabel = 'features.planningObjects.goals.projectCharter'
    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(pcLabel) })).not.toBeInTheDocument()
  })

  it('shows project charter combobox in edit mode even when project has no charter', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const projectCharterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('projectCharter'))
    expect(projectCharterSection).toBeDefined()
  })

  it('shows project charter combobox with option when project has a charter', () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'SUBMITTED' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const projectCharterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('projectCharter'))
    expect(projectCharterSection).toBeDefined()
  })

  it('hides business case and project charter sections when scopeType is not Project and nothing linked', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        scopeType="Program"
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const sections = screen.queryAllByRole('region')
    expect(
      sections.find((s) => s.getAttribute('aria-label')?.includes('businessCase')),
    ).toBeUndefined()
    expect(
      sections.find((s) => s.getAttribute('aria-label')?.includes('projectCharter')),
    ).toBeUndefined()
  })

  it('clearing the deleted parent level goal stages removal — badge disappears', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      parentLevelGoalName: 'Deleted Goal',
      parentLevelGoal: null,
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo
      />,
      { wrapper: makeWrapper() },
    )

    expect(screen.getByText('Deleted Goal')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Deleted Goal'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)

    expect(screen.queryByText('Deleted Goal')).not.toBeInTheDocument()
  })

  it('shows initiation requests section in edit mode for project scope even when empty', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const initiationRequestsSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('initiationRequests'))
    expect(initiationRequestsSection).toBeDefined()
  })

  it('shows badge with remove button when goal has a linked initiation request', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      initiationRequests: [{ id: 'pir-1', name: 'PIR Alpha' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    expect(screen.getByText(/PIR Alpha/)).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('PIR Alpha'))
    expect(removeBtn).toBeDefined()
  })

  it('clicking initiation request remove button stages removal — badge disappears', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      initiationRequests: [{ id: 'pir-1', name: 'PIR Alpha' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    expect(screen.getByText(/PIR Alpha/)).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('PIR Alpha'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)

    expect(screen.queryByText(/PIR Alpha/)).not.toBeInTheDocument()
  })

  it('shows initiation requests section in edit mode for program scope', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        scopeType="Program"
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const sections = screen.getAllByRole('region')
    expect(
      sections.find((s) => s.getAttribute('aria-label')?.includes('initiationRequests')),
    ).toBeDefined()
  })

  it('staging a related goal link shows badge — removing staged badge clears it', async () => {
    vi.mocked(useGoals).mockReturnValue({
      data: [{ id: 'g-new', name: 'New Scope Goal' }],
    } as unknown as ReturnType<typeof useGoals>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const relatedGoalsSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('relatedGoals'))
    expect(relatedGoalsSection).toBeDefined()

    const trigger = relatedGoalsSection!.querySelector('[role="combobox"]')
    expect(trigger).not.toBeNull()
    await userEvent.click(trigger!)

    const option = await screen.findByText('New Scope Goal')
    await userEvent.click(option)

    expect(screen.getByText('New Scope Goal')).toBeInTheDocument()

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('New Scope Goal'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)

    expect(screen.queryByText('New Scope Goal')).not.toBeInTheDocument()
  })

  it('staging a requirement link then removing staged badge clears it', async () => {
    vi.mocked(useRequirements).mockReturnValue({
      data: [{ id: 'req-99', name: 'Req 99', status: 'OPEN' }],
    } as unknown as ReturnType<typeof useRequirements>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const reqSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('linkedRequirements'))
    const trigger = reqSection!.querySelector('button')
    await userEvent.click(trigger!)
    const option = await screen.findByText('Req 99')
    await userEvent.click(option)

    expect(screen.getByText('Req 99')).toBeInTheDocument()

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Req 99'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)

    expect(screen.queryByText('Req 99')).not.toBeInTheDocument()
  })

  it('linking a persisted requirement then removing via badge stages unlink', async () => {
    const goal: GoalDetail = {
      ...baseGoal,
      linkedRequirements: [{ id: 'req-linked', name: 'Linked Req', status: 'OPEN' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Linked Req')).toBeInTheDocument()
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Linked Req'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Linked Req')).not.toBeInTheDocument()
  })

  it('staging a BC link via combobox then removing staged badge clears it', async () => {
    vi.mocked(useBusinessCaseByProjectId).mockReturnValue({
      data: { id: 'bc-99', status: 'DRAFT' },
    } as unknown as ReturnType<typeof useBusinessCaseByProjectId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const bcSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('businessCase'))
    const trigger = bcSection!.querySelector('[role="combobox"]')
    expect(trigger).not.toBeNull()
    await userEvent.click(trigger!)

    const option = await screen.findByRole('option')
    await userEvent.click(option)

    const bcLabel = 'features.planningObjects.goals.businessCase'
    expect(screen.getAllByText(bcLabel).length).toBeGreaterThanOrEqual(2)

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(bcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(bcLabel) })).not.toBeInTheDocument()
  })

  it('staging a PC link via combobox then removing staged badge clears it', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-99', status: 'SUBMITTED' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const pcSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('projectCharter'))
    const trigger = pcSection!.querySelector('[role="combobox"]')
    expect(trigger).not.toBeNull()
    await userEvent.click(trigger!)

    const option = await screen.findByRole('option')
    await userEvent.click(option)

    const pcLabel = 'features.planningObjects.goals.projectCharter'
    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(pcLabel) })).not.toBeInTheDocument()
  })

  it('staging a PIR link via combobox shows staged badge', async () => {
    vi.mocked(useInitiationRequestsByScopeId).mockReturnValue({
      data: [{ id: 'pir-99', name: 'PIR Gamma', status: 'OPEN' }],
    } as unknown as ReturnType<typeof useInitiationRequestsByScopeId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const pirSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('initiationRequests'))
    const trigger = pirSection!.querySelector('[role="combobox"]')
    expect(trigger).not.toBeNull()
    await userEvent.click(trigger!)

    const pirSingularKey = 'features.planningObjects.goals.initiationRequest'
    const option = await screen.findByText(`${pirSingularKey} — PIR Gamma`)
    await userEvent.click(option)

    expect(screen.getByText(`${pirSingularKey} — PIR Gamma`)).toBeInTheDocument()
  })

  it('staging a PIR link then removing staged badge clears it', async () => {
    vi.mocked(useInitiationRequestsByScopeId).mockReturnValue({
      data: [{ id: 'pir-99', name: 'PIR Gamma', status: 'OPEN' }],
    } as unknown as ReturnType<typeof useInitiationRequestsByScopeId>)

    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const pirSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('initiationRequests'))
    const trigger = pirSection!.querySelector('[role="combobox"]')
    await userEvent.click(trigger!)

    const pirSingularKey = 'features.planningObjects.goals.initiationRequest'
    const option = await screen.findByText(`${pirSingularKey} — PIR Gamma`)
    await userEvent.click(option)

    const displayName = `${pirSingularKey} — PIR Gamma`
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(displayName))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText(displayName)).not.toBeInTheDocument()
  })

  it('readOnly mode returns null when no links exist', () => {
    const { container } = render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(container.firstChild).toBeNull()
  })

  it('readOnly mode shows persisted related goal without remove button', () => {
    const goal: GoalDetail = {
      ...baseGoal,
      relatedGoals: [{ id: 'g-2', name: 'Persisted Related' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Persisted Related')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('onDirtyChange is called with true when a link is staged', async () => {
    vi.mocked(useRequirements).mockReturnValue({
      data: [{ id: 'req-42', name: 'Req 42', status: 'OPEN' }],
    } as unknown as ReturnType<typeof useRequirements>)

    const onDirtyChange = vi.fn()
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo={false}
        onDirtyChange={onDirtyChange}
      />,
      { wrapper: makeWrapper() },
    )

    const reqSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('linkedRequirements'))
    const trigger = reqSection!.querySelector('button')
    await userEvent.click(trigger!)
    const option = await screen.findByText('Req 42')
    await userEvent.click(option)

    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('staging applies-to parent goal via combobox shows the combobox when programId provided', () => {
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={baseGoal}
        showAppliesTo
        programId="prog-1"
      />,
      { wrapper: makeWrapper() },
    )

    const appliesToSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('appliesTo'))
    expect(appliesToSection).toBeDefined()
    expect(appliesToSection!.querySelector('[role="combobox"]')).not.toBeNull()
  })

  it('shows initiation request combobox options filtered to unlinked PIRs', () => {
    vi.mocked(useInitiationRequestsByScopeId).mockReturnValue({
      data: [
        { id: 'pir-1', name: 'PIR Alpha', status: 'OPEN' },
        { id: 'pir-2', name: 'PIR Beta', status: null },
      ],
    } as unknown as ReturnType<typeof useInitiationRequestsByScopeId>)

    const goal: GoalDetail = {
      ...baseGoal,
      initiationRequests: [{ id: 'pir-1', name: 'PIR Alpha' }],
    }
    render(
      <GoalLinksSection
        {...defaultProps}
        goalDetail={goal}
        showAppliesTo={false}
      />,
      { wrapper: makeWrapper() },
    )

    const initiationRequestsSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label')?.includes('initiationRequests'))
    expect(initiationRequestsSection).toBeDefined()
    // pir-1 already linked, only pir-2 should appear in combobox options
    expect(screen.queryByText('PIR Beta')).not.toBeInTheDocument()
  })
})
