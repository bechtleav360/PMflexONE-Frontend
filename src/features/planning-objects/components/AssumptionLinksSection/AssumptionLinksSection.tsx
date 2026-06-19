import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useRiskEntries } from '@/entities/risk-entry'
import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'
import { cn } from '@/shared/lib/utils'

import { useLinkAssumptionToProjectCharter } from '../../hooks/useLinkAssumptionToProjectCharter'
import { useLinkAssumptionToRiskEntry } from '../../hooks/useLinkAssumptionToRiskEntry'
import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import { useUnlinkAssumptionFromProjectCharter } from '../../hooks/useUnlinkAssumptionFromProjectCharter'
import { useUnlinkAssumptionFromRiskEntry } from '../../hooks/useUnlinkAssumptionFromRiskEntry'
import type { AssumptionListItem } from '../../types/assumption.types'

/** Imperative handle exposed by {@link AssumptionLinksSection}. */
export interface AssumptionLinksSectionHandle {
  /**
   * Flushes all staged link/unlink mutations to the backend.
   * Call this before the parent form submits.
   */
  flush: () => Promise<void>
}

/** Props for {@link AssumptionLinksSection}. */
export interface AssumptionLinksSectionProps {
  /** The assumption being edited. */
  assumption: AssumptionListItem
  /** ID of the project scope. */
  scopeId: string
  /** When true, hides remove buttons and add comboboxes. */
  readOnly?: boolean
  /** Called whenever the dirty state of this section changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Renders the link sections of an assumption edit form:
 * 1. "Projektauftrag" — Project Charter link (staged, flushed on save)
 * 2. "Verknüpfte Risiken" — Manually linked risk entries (staged, flushed on save)
 *
 * All link changes are staged locally and only persisted when the parent form
 * calls {@link AssumptionLinksSectionHandle.flush} via the forwarded ref.
 *
 * @param props - {@link AssumptionLinksSectionProps}.
 * @param ref - Ref exposing the `flush()` imperative handle.
 * @returns The rendered links section.
 */
export const AssumptionLinksSection = forwardRef<
  AssumptionLinksSectionHandle,
  AssumptionLinksSectionProps
>(
  // eslint-disable-next-line max-lines-per-function, complexity -- tree/link-section component; line count driven by render structure and state handlers
  function AssumptionLinksSection({ assumption, scopeId, readOnly = false, onDirtyChange }, ref) {
    const { t } = useTranslation()

    const [pendingCharterLink, setPendingCharterLink] = useState<string | null>(null)
    const [pendingCharterUnlink, setPendingCharterUnlink] = useState(false)

    const [pendingRiskLinkIds, setPendingRiskLinkIds] = useState<Set<string>>(new Set())
    const [pendingRiskUnlinkIds, setPendingRiskUnlinkIds] = useState<Set<string>>(new Set())

    useEffect(() => {
      onDirtyChange?.(
        pendingCharterLink !== null ||
          pendingCharterUnlink ||
          pendingRiskLinkIds.size > 0 ||
          pendingRiskUnlinkIds.size > 0,
      )
    }, [
      pendingCharterLink,
      pendingCharterUnlink,
      pendingRiskLinkIds,
      pendingRiskUnlinkIds,
      onDirtyChange,
    ])

    const { data: projectCharter } = useProjectCharterByProjectId(scopeId)
    const linkToProjectCharter = useLinkAssumptionToProjectCharter()
    const unlinkFromProjectCharter = useUnlinkAssumptionFromProjectCharter()

    const linkToRiskEntry = useLinkAssumptionToRiskEntry()
    const unlinkFromRiskEntry = useUnlinkAssumptionFromRiskEntry()
    const { data: riskEntries = [] } = useRiskEntries('Project', scopeId)

    useImperativeHandle(ref, () => ({
      flush: async () => {
        const charterPromises: Promise<unknown>[] = []
        if (pendingCharterLink) {
          charterPromises.push(
            linkToProjectCharter.mutateAsync({
              assumptionId: assumption.id,
              projectCharterId: pendingCharterLink,
            }),
          )
        }
        if (pendingCharterUnlink && assumption.projectCharter) {
          charterPromises.push(
            unlinkFromProjectCharter.mutateAsync({
              assumptionId: assumption.id,
              projectCharterId: assumption.projectCharter.id,
            }),
          )
        }
        const riskLinkPromises = [...pendingRiskLinkIds].map((riskEntryId) =>
          linkToRiskEntry.mutateAsync({ assumptionId: assumption.id, riskEntryId }),
        )
        const riskUnlinkPromises = [...pendingRiskUnlinkIds].map((riskEntryId) =>
          unlinkFromRiskEntry.mutateAsync({ assumptionId: assumption.id, riskEntryId }),
        )
        await Promise.all([...charterPromises, ...riskLinkPromises, ...riskUnlinkPromises])
      },
    }))

    const hasCharter = (assumption.projectCharter && !pendingCharterUnlink) || !!pendingCharterLink
    const pcLabel = t('features.planningObjects.assumptions.projectCharterLabel')
    const pcOptionLabel = projectCharter?.project?.name
      ? `${pcLabel} — ${projectCharter.project.name}`
      : pcLabel

    const projectCharterOptions: ComboboxOption[] =
      projectCharter && !hasCharter ? [{ value: projectCharter.id, label: pcOptionLabel }] : []

    // Compute visible risk set: persisted (minus staged removals) + staged additions
    const persistedRiskIds = new Set(assumption.relatedRisks.map((r) => r.id))
    const visiblePersistedRisks = assumption.relatedRisks.filter(
      (r) => !pendingRiskUnlinkIds.has(r.id),
    )

    const stagedRiskAdditions = [...pendingRiskLinkIds].map((id) => {
      const entry = riskEntries.find((r) => r.id === id)
      return { id, name: entry ? `${entry.entryNumber} ${entry.name}` : id }
    })

    const excludedRiskIds = new Set([
      ...persistedRiskIds,
      ...pendingRiskLinkIds,
      ...(assumption.linkedRisk ? [assumption.linkedRisk.id] : []),
    ])
    const availableRiskOptions: ComboboxOption[] = riskEntries
      .filter((r) => !excludedRiskIds.has(r.id))
      .map((r) => ({ value: r.id, label: `${r.entryNumber} ${r.name}` }))

    return (
      <div className="flex flex-col gap-6">
        {/* Section 1 — Project Charter (staged) */}
        {(!readOnly || hasCharter) && (
          <section aria-label={pcLabel}>
            <h3 className="text-foreground mb-2 text-sm font-medium">{pcLabel}</h3>
            {hasCharter ? (
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={cn('flex items-center gap-1', pendingCharterLink && 'opacity-70')}
                >
                  <span>{pcLabel}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      aria-label={t('shared.linksPanel.removeAriaLabel', { name: pcLabel })}
                      className="focus-visible:ring-ring ml-1 rounded-sm outline-none focus-visible:ring-2"
                      onClick={() => {
                        if (pendingCharterLink) {
                          setPendingCharterLink(null)
                        } else {
                          setPendingCharterUnlink(true)
                        }
                      }}
                    >
                      <X
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </Badge>
              </div>
            ) : (
              !readOnly && (
                <Combobox
                  options={projectCharterOptions}
                  value={null}
                  onChange={(value) => value && setPendingCharterLink(value)}
                  placeholder={t('shared.combobox.placeholder')}
                  searchPlaceholder={t('shared.combobox.searchPlaceholder')}
                  noResultsText={t('shared.combobox.noResults')}
                />
              )
            )}
          </section>
        )}

        {/* Section 2 — Manually linked risks (staged) */}
        {(!readOnly || visiblePersistedRisks.length > 0 || stagedRiskAdditions.length > 0) && (
          <section aria-label={t('features.planningObjects.assumptions.relatedRisksLabel')}>
            <h3 className="text-foreground mb-2 text-sm font-medium">
              {t('features.planningObjects.assumptions.relatedRisksLabel')}
            </h3>
            {(visiblePersistedRisks.length > 0 || stagedRiskAdditions.length > 0) && (
              <div className="mb-2 flex flex-wrap gap-2">
                {visiblePersistedRisks.map((risk) => (
                  <Badge
                    key={risk.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span>{risk.name}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        aria-label={t('shared.linksPanel.removeAriaLabel', { name: risk.name })}
                        className="focus-visible:ring-ring ml-1 rounded-sm outline-none focus-visible:ring-2"
                        onClick={() =>
                          setPendingRiskUnlinkIds((prev) => new Set([...prev, risk.id]))
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
                {stagedRiskAdditions.map((risk) => (
                  <Badge
                    key={risk.id}
                    variant="secondary"
                    className="flex items-center gap-1 opacity-70"
                  >
                    <span>{risk.name}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        aria-label={t('shared.linksPanel.removeAriaLabel', { name: risk.name })}
                        className="focus-visible:ring-ring ml-1 rounded-sm outline-none focus-visible:ring-2"
                        onClick={() =>
                          setPendingRiskLinkIds((prev) => {
                            const next = new Set(prev)
                            next.delete(risk.id)
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
                options={availableRiskOptions}
                value={null}
                onChange={(id) => id && setPendingRiskLinkIds((prev) => new Set([...prev, id]))}
                placeholder={t('shared.combobox.placeholder')}
                searchPlaceholder={t('shared.combobox.searchPlaceholder')}
                noResultsText={t('shared.combobox.noResults')}
              />
            )}
          </section>
        )}
      </div>
    )
  },
)
