import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import { useGoals } from '../../hooks/useGoals'
import { useLinkGoalToRequirement } from '../../hooks/useLinkGoalToRequirement'
import { useUnlinkGoalFromRequirement } from '../../hooks/useUnlinkGoalFromRequirement'

/** Imperative handle exposed by {@link RequirementGoalLinksSection}. */
export interface RequirementGoalLinksSectionHandle {
  /**
   * Flushes all staged link/unlink mutations to the backend.
   * Call this before the parent form submits.
   */
  flush: () => Promise<void>
}

/** Props for {@link RequirementGoalLinksSection}. */
export interface RequirementGoalLinksSectionProps {
  /** ID of the requirement being edited. */
  requirementId: string
  /** Currently linked goals from the requirement detail. */
  linkedGoals: { id: string; name: string }[]
  /** Project scope ID used to search for goals. */
  scopeId: string
  /** When true, hides remove buttons and the add combobox. */
  readOnly?: boolean
}

/**
 * Renders the linked goals section of the requirement edit form.
 *
 * Changes (adds and removes) are staged locally and only persisted to the
 * backend when the parent form calls {@link RequirementGoalLinksSectionHandle.flush}
 * via the forwarded ref before submitting.
 *
 * @param props - Component props.
 * @param props.requirementId - ID of the requirement being edited.
 * @param props.linkedGoals - Currently persisted linked goals.
 * @param props.scopeId - Project scope ID for searching goals.
 * @param ref - Ref exposing the `flush()` imperative handle.
 * @returns The rendered linked goals section.
 */
export const RequirementGoalLinksSection = forwardRef<
  RequirementGoalLinksSectionHandle,
  RequirementGoalLinksSectionProps
>(function RequirementGoalLinksSection(
  { requirementId, linkedGoals, scopeId, readOnly = false },
  ref,
) {
  const { t } = useTranslation()
  const pendingRef = useRef<Set<Promise<void>>>(new Set())

  const { data: allGoals = [] } = useGoals('Project', scopeId)
  const linkGoal = useLinkGoalToRequirement()
  const unlinkGoal = useUnlinkGoalFromRequirement()

  const track = useCallback((p: Promise<void>) => {
    pendingRef.current.add(p)
    void p.finally(() => pendingRef.current.delete(p))
  }, [])

  useImperativeHandle(ref, () => ({
    flush: () => Promise.all([...pendingRef.current]).then(() => undefined),
  }))

  if (readOnly && linkedGoals.length === 0) return null

  const excludedIds = new Set(linkedGoals.map((g) => g.id))
  const goalOptions: ComboboxOption[] = allGoals
    .filter((g) => !excludedIds.has(g.id))
    .map((g) => ({ value: g.id, label: g.name }))

  return (
    <section
      aria-labelledby="req-goals-heading"
      className="flex flex-col gap-3"
    >
      <h3
        id="req-goals-heading"
        className="text-foreground text-sm font-medium"
      >
        {t('features.planningObjects.requirements.linkedGoals')}
      </h3>

      {linkedGoals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linkedGoals.map((goal) => (
            <Badge
              key={goal.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span>{goal.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={t('features.planningObjects.requirements.removeGoalAriaLabel', {
                    name: goal.name,
                  })}
                  className="focus-visible:ring-ring ml-1 rounded-sm outline-none focus-visible:ring-2"
                  onClick={() => track(unlinkGoal.mutateAsync({ goalId: goal.id, requirementId }))}
                  disabled={unlinkGoal.isPending}
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
          options={goalOptions}
          value={null}
          onChange={(value) => {
            if (value) track(linkGoal.mutateAsync({ goalId: value, requirementId }))
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
})
