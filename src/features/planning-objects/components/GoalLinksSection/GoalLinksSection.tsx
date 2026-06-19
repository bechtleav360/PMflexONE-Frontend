import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { GOAL_QUERY_KEY } from '../../api/goalApi'
import { useBusinessCaseByProjectId } from '../../hooks/useBusinessCaseByProjectId'
import { useClearParentLevelGoal } from '../../hooks/useClearParentLevelGoal'
import { useGoals } from '../../hooks/useGoals'
import { useInitiationRequestsByScopeId } from '../../hooks/useInitiationRequestsByScopeId'
import { useLinkGoals } from '../../hooks/useLinkGoals'
import { useLinkGoalToBusinessCase } from '../../hooks/useLinkGoalToBusinessCase'
import { useLinkGoalToInitiationRequest } from '../../hooks/useLinkGoalToInitiationRequest'
import { useLinkGoalToProjectCharter } from '../../hooks/useLinkGoalToProjectCharter'
import { useLinkGoalToRequirement } from '../../hooks/useLinkGoalToRequirement'
import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import { useRequirements } from '../../hooks/useRequirements'
import { useSetParentLevelGoal } from '../../hooks/useSetParentLevelGoal'
import { useUnlinkGoalFromBusinessCase } from '../../hooks/useUnlinkGoalFromBusinessCase'
import { useUnlinkGoalFromInitiationRequest } from '../../hooks/useUnlinkGoalFromInitiationRequest'
import { useUnlinkGoalFromProjectCharter } from '../../hooks/useUnlinkGoalFromProjectCharter'
import { useUnlinkGoalFromRequirement } from '../../hooks/useUnlinkGoalFromRequirement'
import { useUnlinkGoals } from '../../hooks/useUnlinkGoals'
import type { GoalDetail } from '../../types/goal.types'
import type { PlanningObjectScopeType } from '../../types/shared.types'
import { GoalAppliesToSection } from './GoalAppliesToSection'
import { GoalDocumentLinksSection } from './GoalDocumentLinksSection'
import { GoalInitiationRequestsSection } from './GoalInitiationRequestsSection'
import { GoalLinkedRequirementsSection } from './GoalLinkedRequirementsSection'
import { GoalRelatedGoalsSection } from './GoalRelatedGoalsSection'

/** Imperative handle exposed by {@link GoalLinksSection}. */
export interface GoalLinksSectionHandle {
  /** Flushes all version-less staged link/unlink mutations before the parent form saves. */
  flushPendingRequirementLink: () => Promise<void>
  /**
   * Flushes version-dependent staged mutations (applies-to) using the version
   * returned by `updateGoal`. Must be called AFTER the core save succeeds.
   *
   * @param newVersion - The goal version returned by the update mutation.
   */
  flushVersionBased: (newVersion: number) => Promise<void>
}

/** Props for {@link GoalLinksSection}. */
export interface GoalLinksSectionProps {
  /** ID of the goal being edited. */
  goalId: string
  /** Optimistic-lock version of the goal. */
  goalVersion: number
  /** Full goal detail including linked entities. */
  goalDetail: GoalDetail
  /** ID of the scope entity (project, program, or portfolio). */
  scopeId: string
  /** Type of the scope entity. */
  scopeType: PlanningObjectScopeType
  /**
   * ID of the parent program used to load program-level goals for the
   * "Applies to" combobox. Pass `null` or omit when there is no parent program.
   */
  programId?: string | null
  /**
   * ID of the parent portfolio used to load portfolio-level goals for the
   * "Applies to" combobox. Pass `null` or omit when there is no parent portfolio.
   */
  portfolioId?: string | null
  /**
   * Whether to render the "Applies to" (parent level goal) section.
   * Typically `true` for project-scoped goals, `false` for program/portfolio goals.
   */
  showAppliesTo: boolean
  /** When true, all add/remove link controls are hidden. */
  readOnly?: boolean
  /** Called whenever the dirty state of the link section changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Renders all link sections of a goal edit form.
 *
 * Every section is staged locally — changes appear immediately in the UI
 * but are only persisted when the parent form calls
 * {@link GoalLinksSectionHandle.flushPendingRequirementLink} on save.
 *
 * @param props - Component props.
 * @param ref - Ref exposing the imperative flush handle.
 * @returns The rendered link sections, or `null` when read-only and no links exist.
 */
export const GoalLinksSection = forwardRef<GoalLinksSectionHandle, GoalLinksSectionProps>(
  // eslint-disable-next-line max-lines-per-function, complexity -- all link-section hooks, staged state, flush logic, and read-only guard must co-locate in this forwardRef render function
  function GoalLinksSection(
    {
      goalId,
      goalVersion: _goalVersion,
      goalDetail,
      scopeId,
      scopeType,
      programId,
      portfolioId,
      showAppliesTo,
      readOnly = false,
      onDirtyChange,
    }: GoalLinksSectionProps,
    ref,
  ) {
    const queryClient = useQueryClient()

    const clearParentLevelGoal = useClearParentLevelGoal(scopeType, scopeId)
    const setParentLevelGoal = useSetParentLevelGoal(scopeType, scopeId)
    const linkGoals = useLinkGoals()
    const unlinkGoals = useUnlinkGoals()
    const linkGoalToRequirement = useLinkGoalToRequirement()
    const unlinkGoalFromRequirement = useUnlinkGoalFromRequirement()
    const linkGoalToBusinessCase = useLinkGoalToBusinessCase()
    const unlinkGoalFromBusinessCase = useUnlinkGoalFromBusinessCase()
    const linkGoalToProjectCharter = useLinkGoalToProjectCharter()
    const unlinkGoalFromProjectCharter = useUnlinkGoalFromProjectCharter()
    const linkGoalToInitiationRequest = useLinkGoalToInitiationRequest()
    const unlinkGoalFromInitiationRequest = useUnlinkGoalFromInitiationRequest()

    const isProjectScope = scopeType === 'Project'
    const { data: projectBusinessCase } = useBusinessCaseByProjectId(isProjectScope ? scopeId : '')
    const { data: projectProjectCharter } = useProjectCharterByProjectId(
      isProjectScope ? scopeId : '',
    )
    const { data: scopeInitiationRequests = [] } = useInitiationRequestsByScopeId(
      scopeId,
      scopeType,
    )
    const { data: scopeGoals = [] } = useGoals(scopeType, scopeId)
    const { data: programGoals = [] } = useGoals('Program', programId ?? '', {
      enabled: !!programId,
    })
    const { data: portfolioGoals = [] } = useGoals('Portfolio', portfolioId ?? '', {
      enabled: !!portfolioId,
    })
    const { data: scopeRequirements = [] } = useRequirements(scopeType, scopeId)

    // Staged: Applies to (version-dependent — flushed after updateGoal)
    const [pendingParentGoalId, setPendingParentGoalId] = useState<string | null>(null)
    const [pendingClearParentGoal, setPendingClearParentGoal] = useState(false)

    // Staged: Related goals
    const [pendingGoalLinks, setPendingGoalLinks] = useState<Set<string>>(new Set())
    const [pendingGoalUnlinks, setPendingGoalUnlinks] = useState<Set<string>>(new Set())

    // Staged: Requirements
    const [pendingLinkIds, setPendingLinkIds] = useState<Set<string>>(new Set())
    const [pendingUnlinkIds, setPendingUnlinkIds] = useState<Set<string>>(new Set())

    // Staged: Business case
    const [pendingBcLink, setPendingBcLink] = useState<string | null>(null)
    const [pendingBcUnlink, setPendingBcUnlink] = useState(false)

    // Staged: Project charter
    const [pendingPcLink, setPendingPcLink] = useState<string | null>(null)
    const [pendingPcUnlink, setPendingPcUnlink] = useState(false)

    // Staged: Initiation requests
    const [pendingPirLinks, setPendingPirLinks] = useState<Set<string>>(new Set())
    const [pendingPirUnlinks, setPendingPirUnlinks] = useState<Set<string>>(new Set())

    const isDirty =
      pendingParentGoalId !== null ||
      pendingClearParentGoal ||
      pendingGoalLinks.size > 0 ||
      pendingGoalUnlinks.size > 0 ||
      pendingLinkIds.size > 0 ||
      pendingUnlinkIds.size > 0 ||
      pendingBcLink !== null ||
      pendingBcUnlink ||
      pendingPcLink !== null ||
      pendingPcUnlink ||
      pendingPirLinks.size > 0 ||
      pendingPirUnlinks.size > 0

    useEffect(() => {
      onDirtyChange?.(isDirty)
    }, [isDirty, onDirtyChange])

    useImperativeHandle(ref, () => ({
      flushVersionBased: async (newVersion: number) => {
        if (pendingClearParentGoal) {
          await clearParentLevelGoal.mutateAsync({ id: goalId, version: newVersion })
        } else if (pendingParentGoalId) {
          await setParentLevelGoal.mutateAsync({
            id: goalId,
            version: newVersion,
            parentLevelGoalId: pendingParentGoalId,
          })
        }
        setPendingParentGoalId(null)
        setPendingClearParentGoal(false)
      },

      // eslint-disable-next-line complexity -- link-section state machine with optimistic updates, flush logic, and error handling
      flushPendingRequirementLink: async () => {
        const promises: Promise<unknown>[] = []

        for (const toId of pendingGoalLinks) {
          promises.push(linkGoals.mutateAsync({ fromId: goalId, toId }))
        }
        for (const toId of pendingGoalUnlinks) {
          promises.push(unlinkGoals.mutateAsync({ fromId: goalId, toId }))
        }
        for (const requirementId of pendingLinkIds) {
          promises.push(linkGoalToRequirement.mutateAsync({ goalId, requirementId }))
        }
        for (const requirementId of pendingUnlinkIds) {
          promises.push(unlinkGoalFromRequirement.mutateAsync({ goalId, requirementId }))
        }
        if (pendingBcUnlink && goalDetail.businessCase) {
          promises.push(
            unlinkGoalFromBusinessCase.mutateAsync({
              goalId,
              businessCaseId: goalDetail.businessCase.id,
            }),
          )
        } else if (pendingBcLink) {
          promises.push(
            linkGoalToBusinessCase.mutateAsync({ goalId, businessCaseId: pendingBcLink }),
          )
        }
        if (pendingPcUnlink && goalDetail.projectCharter) {
          promises.push(
            unlinkGoalFromProjectCharter.mutateAsync({
              goalId,
              projectCharterId: goalDetail.projectCharter.id,
            }),
          )
        } else if (pendingPcLink) {
          promises.push(
            linkGoalToProjectCharter.mutateAsync({ goalId, projectCharterId: pendingPcLink }),
          )
        }
        for (const initiationRequestId of pendingPirLinks) {
          promises.push(linkGoalToInitiationRequest.mutateAsync({ goalId, initiationRequestId }))
        }
        for (const initiationRequestId of pendingPirUnlinks) {
          promises.push(
            unlinkGoalFromInitiationRequest.mutateAsync({ goalId, initiationRequestId }),
          )
        }

        await Promise.all(promises)

        if (promises.length > 0) {
          await queryClient.refetchQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
        }

        setPendingGoalLinks(new Set())
        setPendingGoalUnlinks(new Set())
        setPendingLinkIds(new Set())
        setPendingUnlinkIds(new Set())
        setPendingBcLink(null)
        setPendingBcUnlink(false)
        setPendingPcLink(null)
        setPendingPcUnlink(false)
        setPendingPirLinks(new Set())
        setPendingPirUnlinks(new Set())
      },
    }))

    // Guard: in read-only mode skip the outer wrapper when no links exist across any section
    if (readOnly) {
      const effectiveHasParentGoal =
        !pendingClearParentGoal && !pendingParentGoalId
          ? !!(goalDetail.parentLevelGoal || goalDetail.parentLevelGoalName)
          : !!pendingParentGoalId
      const effectiveBc = (goalDetail.businessCase && !pendingBcUnlink) || !!pendingBcLink
      const effectivePc = (goalDetail.projectCharter && !pendingPcUnlink) || !!pendingPcLink
      const hasAnyLinks =
        effectiveHasParentGoal ||
        goalDetail.relatedGoals.some((g) => !pendingGoalUnlinks.has(g.id)) ||
        pendingGoalLinks.size > 0 ||
        goalDetail.linkedRequirements.some((r) => !pendingUnlinkIds.has(r.id)) ||
        pendingLinkIds.size > 0 ||
        effectiveBc ||
        effectivePc ||
        goalDetail.initiationRequests.some((r) => !pendingPirUnlinks.has(r.id)) ||
        pendingPirLinks.size > 0
      if (!hasAnyLinks) return null
    }

    return (
      <div className="mt-2 flex flex-col gap-6">
        {showAppliesTo && (
          <GoalAppliesToSection
            goalDetail={goalDetail}
            programGoals={programGoals}
            portfolioGoals={portfolioGoals}
            programId={programId}
            portfolioId={portfolioId}
            pendingParentGoalId={pendingParentGoalId}
            setPendingParentGoalId={setPendingParentGoalId}
            pendingClearParentGoal={pendingClearParentGoal}
            setPendingClearParentGoal={setPendingClearParentGoal}
            readOnly={readOnly}
          />
        )}

        <GoalRelatedGoalsSection
          goalId={goalId}
          goalDetail={goalDetail}
          scopeGoals={scopeGoals}
          pendingGoalLinks={pendingGoalLinks}
          setPendingGoalLinks={setPendingGoalLinks}
          pendingGoalUnlinks={pendingGoalUnlinks}
          setPendingGoalUnlinks={setPendingGoalUnlinks}
          readOnly={readOnly}
        />

        <GoalLinkedRequirementsSection
          goalDetail={goalDetail}
          scopeRequirements={scopeRequirements}
          pendingLinkIds={pendingLinkIds}
          setPendingLinkIds={setPendingLinkIds}
          pendingUnlinkIds={pendingUnlinkIds}
          setPendingUnlinkIds={setPendingUnlinkIds}
          readOnly={readOnly}
        />

        <GoalDocumentLinksSection
          linkedDocument={goalDetail.businessCase}
          scopeDocument={projectBusinessCase}
          pendingLink={pendingBcLink}
          setPendingLink={setPendingBcLink}
          pendingUnlink={pendingBcUnlink}
          setPendingUnlink={setPendingBcUnlink}
          labelKey="features.planningObjects.goals.businessCase"
          isProjectScope={isProjectScope}
          readOnly={readOnly}
        />

        <GoalDocumentLinksSection
          linkedDocument={goalDetail.projectCharter}
          scopeDocument={projectProjectCharter}
          pendingLink={pendingPcLink}
          setPendingLink={setPendingPcLink}
          pendingUnlink={pendingPcUnlink}
          setPendingUnlink={setPendingPcUnlink}
          labelKey="features.planningObjects.goals.projectCharter"
          isProjectScope={isProjectScope}
          readOnly={readOnly}
        />

        <GoalInitiationRequestsSection
          persistedPirs={goalDetail.initiationRequests}
          scopeInitiationRequests={scopeInitiationRequests}
          pendingPirLinks={pendingPirLinks}
          setPendingPirLinks={setPendingPirLinks}
          pendingPirUnlinks={pendingPirUnlinks}
          setPendingPirUnlinks={setPendingPirUnlinks}
          readOnly={readOnly}
        />
      </div>
    )
  },
)
