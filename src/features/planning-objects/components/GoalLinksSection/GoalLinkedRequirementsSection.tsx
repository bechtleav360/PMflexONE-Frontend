import type { Dispatch, SetStateAction } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import type { GoalDetail, RequirementRef } from '../../types/goal.types'
import type { RequirementListItem } from '../../types/requirement.types'

/** Props for {@link GoalLinkedRequirementsSection}. */
export interface GoalLinkedRequirementsSectionProps {
  /** Full goal detail including already-persisted linked requirements. */
  goalDetail: GoalDetail
  /** All requirements in the current scope, used to populate the add combobox. */
  scopeRequirements: RequirementListItem[]
  /** Requirement IDs staged for linking (not yet persisted). */
  pendingLinkIds: Set<string>
  /** Updates the staged link-ids set. */
  setPendingLinkIds: Dispatch<SetStateAction<Set<string>>>
  /** Requirement IDs staged for unlinking (not yet persisted). */
  pendingUnlinkIds: Set<string>
  /** Updates the staged unlink-ids set. */
  setPendingUnlinkIds: Dispatch<SetStateAction<Set<string>>>
  /** When true, all link controls are hidden. */
  readOnly: boolean
}

/**
 * Renders the "Linked requirements" section of a goal edit form.
 *
 * @param props - Component props.
 * @returns The rendered linked-requirements section.
 */
// eslint-disable-next-line max-lines-per-function -- render-only; JSX badge lists account for the line count
export function GoalLinkedRequirementsSection({
  goalDetail,
  scopeRequirements,
  pendingLinkIds,
  setPendingLinkIds,
  pendingUnlinkIds,
  setPendingUnlinkIds,
  readOnly,
}: GoalLinkedRequirementsSectionProps) {
  const { t } = useTranslation()

  const persistedReqIds = new Set(goalDetail.linkedRequirements.map((r: RequirementRef) => r.id))
  const persistedLinkedReqs = goalDetail.linkedRequirements.filter(
    (r: RequirementRef) => !pendingUnlinkIds.has(r.id),
  )
  const pendingAdditions = scopeRequirements.filter(
    (r) => pendingLinkIds.has(r.id) && !persistedReqIds.has(r.id),
  )
  const excludedReqIds = new Set([
    ...persistedLinkedReqs.map((r: RequirementRef) => r.id),
    ...pendingLinkIds,
  ])
  const requirementOptions: ComboboxOption[] = scopeRequirements
    .filter((r) => !excludedReqIds.has(r.id))
    .map((r) => ({ value: r.id, label: r.name }))
  const hasRequirementsToShow = persistedLinkedReqs.length > 0 || pendingAdditions.length > 0

  if (readOnly && !hasRequirementsToShow) return null

  return (
    <section aria-label={t('features.planningObjects.goals.linkedRequirements')}>
      <h3 className="text-foreground mb-2 text-sm font-medium">
        {t('features.planningObjects.goals.linkedRequirements')}
      </h3>

      {hasRequirementsToShow && (
        <div className="mb-2 flex flex-wrap gap-2">
          {persistedLinkedReqs.map((req: RequirementRef) => (
            <Badge
              key={req.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span>{req.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={t('shared.linksPanel.removeAriaLabel', { name: req.name })}
                  className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                  onClick={() => setPendingUnlinkIds((prev) => new Set([...prev, req.id]))}
                >
                  <X
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                </button>
              )}
            </Badge>
          ))}
          {pendingAdditions.map((req) => (
            <Badge
              key={req.id}
              variant="outline"
              className="flex items-center gap-1"
            >
              <span>{req.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  aria-label={t('shared.linksPanel.removeAriaLabel', { name: req.name })}
                  className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                  onClick={() =>
                    setPendingLinkIds((prev) => {
                      const next = new Set(prev)
                      next.delete(req.id)
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
          options={requirementOptions}
          value={null}
          onChange={(value) => {
            if (value) setPendingLinkIds((prev) => new Set([...prev, value]))
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
}
