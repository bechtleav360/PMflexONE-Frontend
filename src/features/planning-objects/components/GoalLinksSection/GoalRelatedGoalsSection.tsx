import type { Dispatch, SetStateAction } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import type { GoalDetail, GoalListItem, GoalRef } from '../../types/goal.types'

/** Props for {@link GoalRelatedGoalsSection}. */
export interface GoalRelatedGoalsSectionProps {
  /** ID of the goal being edited (excluded from selectable goals). */
  goalId: string
  /** Full goal detail including already-persisted related goals. */
  goalDetail: GoalDetail
  /** All goals in the current scope, used to populate the add combobox. */
  scopeGoals: GoalListItem[]
  /** Goal IDs staged for linking (not yet persisted). */
  pendingGoalLinks: Set<string>
  /** Updates the staged goal-links set. */
  setPendingGoalLinks: Dispatch<SetStateAction<Set<string>>>
  /** Goal IDs staged for unlinking (not yet persisted). */
  pendingGoalUnlinks: Set<string>
  /** Updates the staged goal-unlinks set. */
  setPendingGoalUnlinks: Dispatch<SetStateAction<Set<string>>>
  /** When true, all link controls are hidden. */
  readOnly: boolean
}

/**
 * Renders the "Related goals" link section of a goal edit form.
 *
 * @param props - Component props.
 * @returns The rendered related-goals section.
 */
// eslint-disable-next-line max-lines-per-function -- render-only; JSX badge lists account for the line count
export function GoalRelatedGoalsSection({
  goalId,
  goalDetail,
  scopeGoals,
  pendingGoalLinks,
  setPendingGoalLinks,
  pendingGoalUnlinks,
  setPendingGoalUnlinks,
  readOnly,
}: GoalRelatedGoalsSectionProps) {
  const { t } = useTranslation()

  const persistedRelatedGoalIds = new Set(goalDetail.relatedGoals.map((g: GoalRef) => g.id))
  const visibleRelatedGoals = goalDetail.relatedGoals.filter(
    (g: GoalRef) => !pendingGoalUnlinks.has(g.id),
  )
  const stagedRelatedGoals = scopeGoals.filter(
    (g) => pendingGoalLinks.has(g.id) && !persistedRelatedGoalIds.has(g.id),
  )
  const excludedGoalIds = new Set([
    goalId,
    ...goalDetail.relatedGoals.map((g: GoalRef) => g.id),
    ...pendingGoalLinks,
  ])
  const relatedGoalOptions: ComboboxOption[] = scopeGoals
    .filter((g) => !excludedGoalIds.has(g.id))
    .map((g) => ({ value: g.id, label: g.name }))
  const hasAnyGoals = visibleRelatedGoals.length > 0 || stagedRelatedGoals.length > 0

  if (readOnly && !hasAnyGoals) return null

  return (
    <section aria-label={t('features.planningObjects.goals.relatedGoals')}>
      <h3 className="text-foreground mb-2 text-sm font-medium">
        {t('features.planningObjects.goals.relatedGoals')}
      </h3>

      {(visibleRelatedGoals.length > 0 || stagedRelatedGoals.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {visibleRelatedGoals.map((goal: GoalRef) => (
            <Badge
              key={goal.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span>{goal.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={t('shared.linksPanel.removeAriaLabel', { name: goal.name })}
                  className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                  onClick={() => setPendingGoalUnlinks((prev) => new Set([...prev, goal.id]))}
                >
                  <X
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                </button>
              )}
            </Badge>
          ))}
          {stagedRelatedGoals.map((goal) => (
            <Badge
              key={goal.id}
              variant="outline"
              className="flex items-center gap-1"
            >
              <span>{goal.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={t('shared.linksPanel.removeAriaLabel', { name: goal.name })}
                  className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                  onClick={() =>
                    setPendingGoalLinks((prev) => {
                      const next = new Set(prev)
                      next.delete(goal.id)
                      return next
                    })
                  }
                >
                  <X
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {!readOnly && (
        <Combobox
          options={relatedGoalOptions}
          value={null}
          onChange={(value) => {
            if (value) setPendingGoalLinks((prev) => new Set([...prev, value]))
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
}
