import type { Dispatch, SetStateAction } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'

import type { EntityRef } from '../../types/shared.types'

/** Minimal shape of an initiation request list item. */
export interface InitiationRequestItem {
  id: string
  name: string
  status: string | null
}

/** Props for {@link GoalInitiationRequestsSection}. */
export interface GoalInitiationRequestsSectionProps {
  /** Initiation requests already linked to the goal (from goal detail). */
  persistedPirs: EntityRef[]
  /** All initiation requests available in the current scope. */
  scopeInitiationRequests: InitiationRequestItem[]
  /** Initiation request IDs staged for linking (not yet persisted). */
  pendingPirLinks: Set<string>
  /** Updates the staged PIR-links set. */
  setPendingPirLinks: Dispatch<SetStateAction<Set<string>>>
  /** Initiation request IDs staged for unlinking (not yet persisted). */
  pendingPirUnlinks: Set<string>
  /** Updates the staged PIR-unlinks set. */
  setPendingPirUnlinks: Dispatch<SetStateAction<Set<string>>>
  /** When true, all link controls are hidden. */
  readOnly: boolean
}

/**
 * Renders the "Initiation requests" link section of a goal edit form.
 *
 * @param props - Component props.
 * @returns The rendered initiation-requests section.
 */
// eslint-disable-next-line max-lines-per-function -- render-only; JSX badge lists account for the line count
export function GoalInitiationRequestsSection({
  persistedPirs,
  scopeInitiationRequests,
  pendingPirLinks,
  setPendingPirLinks,
  pendingPirUnlinks,
  setPendingPirUnlinks,
  readOnly,
}: GoalInitiationRequestsSectionProps) {
  const { t } = useTranslation()

  const pirSingularLabel = t('features.planningObjects.goals.initiationRequest')
  const persistedPirIds = new Set(persistedPirs.map((r) => r.id))
  const visiblePirs = persistedPirs.filter((r) => !pendingPirUnlinks.has(r.id))
  const stagedPirs = scopeInitiationRequests.filter(
    (r) => pendingPirLinks.has(r.id) && !persistedPirIds.has(r.id),
  )
  const excludedPirIds = new Set([...persistedPirs.map((r) => r.id), ...pendingPirLinks])
  const pirOptions: ComboboxOption[] = scopeInitiationRequests
    .filter((r) => !excludedPirIds.has(r.id))
    .map((r) => ({ value: r.id, label: `${pirSingularLabel} — ${r.name}` }))
  const hasAnyPir = visiblePirs.length > 0 || stagedPirs.length > 0

  if (readOnly && !hasAnyPir) return null

  return (
    <section aria-label={t('features.planningObjects.goals.initiationRequests')}>
      <h3 className="text-foreground mb-2 text-sm font-medium">
        {t('features.planningObjects.goals.initiationRequests')}
      </h3>

      {hasAnyPir && (
        <div className="mb-2 flex flex-wrap gap-2">
          {visiblePirs.map((pir) => {
            const pirDisplayName = `${pirSingularLabel} — ${pir.name}`
            return (
              <Badge
                key={pir.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span>{pirDisplayName}</span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t('shared.linksPanel.removeAriaLabel', { name: pirDisplayName })}
                    className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                    onClick={() => setPendingPirUnlinks((prev) => new Set([...prev, pir.id]))}
                  >
                    <X
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </Badge>
            )
          })}
          {stagedPirs.map((pir) => {
            const pirDisplayName = `${pirSingularLabel} — ${pir.name}`
            return (
              <Badge
                key={pir.id}
                variant="outline"
                className="flex items-center gap-1"
              >
                <span>{pirDisplayName}</span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t('shared.linksPanel.removeAriaLabel', { name: pirDisplayName })}
                    className="focus-visible:ring-ring ml-1 rounded-sm focus-visible:ring-2"
                    onClick={() =>
                      setPendingPirLinks((prev) => {
                        const next = new Set(prev)
                        next.delete(pir.id)
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
            )
          })}
        </div>
      )}

      {!readOnly && !hasAnyPir && (
        <Combobox
          options={pirOptions}
          value={null}
          onChange={(value) => {
            if (value) setPendingPirLinks((prev) => new Set([...prev, value]))
          }}
          placeholder={t('shared.combobox.placeholder')}
          searchPlaceholder={t('shared.combobox.searchPlaceholder')}
          noResultsText={t('shared.combobox.noResults')}
        />
      )}
    </section>
  )
}
