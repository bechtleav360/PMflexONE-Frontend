import type { Dispatch, SetStateAction } from 'react'

import { useTranslation } from 'react-i18next'

import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import type { GoalDetail, GoalListItem } from '../../types/goal.types'
import { ParentGoalBadge } from './ParentGoalBadge'

/** Props for {@link GoalAppliesToSection}. */
export interface GoalAppliesToSectionProps {
  /** Full goal detail including parent-level goal context. */
  goalDetail: GoalDetail
  /** Program-level goals available for selection in the "Applies to" combobox. */
  programGoals: GoalListItem[]
  /** Portfolio-level goals available for selection in the "Applies to" combobox. */
  portfolioGoals: GoalListItem[]
  /** Program ID used to scope the "Applies to" combobox. */
  programId?: string | null
  /** Portfolio ID used to scope the "Applies to" combobox. */
  portfolioId?: string | null
  /** Staged parent goal ID not yet persisted (version-dependent, flushed after save). */
  pendingParentGoalId: string | null
  /** Updates the staged parent goal ID. */
  setPendingParentGoalId: Dispatch<SetStateAction<string | null>>
  /** Whether a clear of the persisted parent goal is staged. */
  pendingClearParentGoal: boolean
  /** Stages or clears the pending clear-parent flag. */
  setPendingClearParentGoal: Dispatch<SetStateAction<boolean>>
  /** When true, all link controls are hidden. */
  readOnly: boolean
}

/**
 * Renders the "Applies to" (parent level goal) section of a goal edit form.
 *
 * @param props - Component props.
 * @returns The rendered "Applies to" section.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- render-only; conditional badge logic for three parent-goal states (persisted, deleted, staged) drives both metrics
export function GoalAppliesToSection({
  goalDetail,
  programGoals,
  portfolioGoals,
  programId,
  portfolioId,
  pendingParentGoalId,
  setPendingParentGoalId,
  pendingClearParentGoal,
  setPendingClearParentGoal,
  readOnly,
}: GoalAppliesToSectionProps) {
  const { t } = useTranslation()

  const parentLevelGoalOptions: ComboboxOption[] = [
    ...programGoals.map((g) => ({
      value: g.id,
      label: g.name,
      group: t('features.planningObjects.goals.parentProgramGoals'),
    })),
    ...portfolioGoals.map((g) => ({
      value: g.id,
      label: g.name,
      group: t('features.planningObjects.goals.parentPortfolioGoals'),
    })),
  ]

  const stagedParentGoalName = pendingParentGoalId
    ? (programGoals.find((g) => g.id === pendingParentGoalId)?.name ??
      portfolioGoals.find((g) => g.id === pendingParentGoalId)?.name ??
      pendingParentGoalId)
    : null
  const showPersistedParentGoal = !pendingClearParentGoal && !pendingParentGoalId
  const effectiveHasParentGoal = showPersistedParentGoal
    ? !!(goalDetail.parentLevelGoal || goalDetail.parentLevelGoalName)
    : !!stagedParentGoalName

  if (readOnly && !effectiveHasParentGoal) return null

  const showCombobox =
    !readOnly &&
    !!(programId || portfolioId) &&
    !pendingParentGoalId &&
    !(showPersistedParentGoal && (goalDetail.parentLevelGoal || goalDetail.parentLevelGoalName))

  return (
    <section aria-label={t('features.planningObjects.goals.appliesTo')}>
      <h3 className="text-foreground mb-2 text-sm font-medium">
        {t('features.planningObjects.goals.appliesTo')}
      </h3>

      {showPersistedParentGoal && goalDetail.parentLevelGoal && (
        <div className="mb-2 flex flex-wrap gap-2">
          <ParentGoalBadge
            name={goalDetail.parentLevelGoal.name}
            variant="secondary"
            readOnly={readOnly}
            removeAriaLabel={t('shared.linksPanel.removeAriaLabel', {
              name: goalDetail.parentLevelGoal.name,
            })}
            onRemove={() => setPendingClearParentGoal(true)}
          />
        </div>
      )}

      {showPersistedParentGoal && !goalDetail.parentLevelGoal && goalDetail.parentLevelGoalName && (
        <div className="mb-2 flex flex-wrap gap-2">
          <ParentGoalBadge
            name={goalDetail.parentLevelGoalName}
            variant="destructive"
            suffix={
              <span className="text-[10px] opacity-80">
                {t('features.planningObjects.goals.parentLevelGoalDeleted')}
              </span>
            }
            readOnly={readOnly}
            removeAriaLabel={t('shared.linksPanel.removeAriaLabel', {
              name: goalDetail.parentLevelGoalName,
            })}
            onRemove={() => setPendingClearParentGoal(true)}
          />
        </div>
      )}

      {stagedParentGoalName && (
        <div className="mb-2 flex flex-wrap gap-2">
          <ParentGoalBadge
            name={stagedParentGoalName}
            variant="outline"
            readOnly={readOnly}
            removeAriaLabel={t('shared.linksPanel.removeAriaLabel', {
              name: stagedParentGoalName,
            })}
            onRemove={() => setPendingParentGoalId(null)}
          />
        </div>
      )}

      {showCombobox && (
        <Combobox
          options={parentLevelGoalOptions}
          value={null}
          onChange={(value) => {
            if (value) {
              setPendingClearParentGoal(false)
              setPendingParentGoalId(value)
            }
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
}
