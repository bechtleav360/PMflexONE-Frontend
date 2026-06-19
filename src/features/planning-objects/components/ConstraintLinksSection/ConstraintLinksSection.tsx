import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/Badge'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'
import { cn } from '@/shared/lib/utils'

import { useLinkProjectConstraintToProjectCharter } from '../../hooks/useLinkProjectConstraintToProjectCharter'
import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import { useUnlinkProjectConstraintFromProjectCharter } from '../../hooks/useUnlinkProjectConstraintFromProjectCharter'
import type { ConstraintListItem } from '../../types/constraint.types'

/** Imperative handle exposed by {@link ConstraintLinksSection}. */
export interface ConstraintLinksSectionHandle {
  /**
   * Flushes staged project charter link/unlink mutation to the backend.
   * Call this before the parent form submits.
   */
  flush: () => Promise<void>
}

/** Props for {@link ConstraintLinksSection}. */
export interface ConstraintLinksSectionProps {
  /** The constraint being edited. */
  constraint: ConstraintListItem
  /** ID of the project scope. */
  scopeId: string
  /** When true, hides remove button and add combobox. */
  readOnly?: boolean
  /** Called whenever the dirty state of this section changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Renders the link sections of a project constraint edit form:
 * 1. "Projektauftrag" — Project Charter link (staged, flushed on save)
 *
 * @param props - Component props.
 * @param ref - Ref exposing `flush()` imperative handle.
 * @returns The rendered links section.
 */
export const ConstraintLinksSection = forwardRef<
  ConstraintLinksSectionHandle,
  ConstraintLinksSectionProps
>(
  // eslint-disable-next-line complexity -- tree/link-section component; line count driven by render structure and state handlers
  function ConstraintLinksSection({ constraint, scopeId, readOnly = false, onDirtyChange }, ref) {
    const { t } = useTranslation()

    const [pendingLink, setPendingLink] = useState<string | null>(null)
    const [pendingUnlink, setPendingUnlink] = useState<boolean>(false)

    useEffect(() => {
      onDirtyChange?.(pendingLink !== null || pendingUnlink)
    }, [pendingLink, pendingUnlink, onDirtyChange])

    const { data: projectCharter } = useProjectCharterByProjectId(scopeId)
    const linkToProjectCharter = useLinkProjectConstraintToProjectCharter('Project', scopeId)
    const unlinkFromProjectCharter = useUnlinkProjectConstraintFromProjectCharter(
      'Project',
      scopeId,
    )

    useImperativeHandle(ref, () => ({
      flush: async () => {
        if (pendingLink) {
          await linkToProjectCharter.mutateAsync({
            constraintId: constraint.id,
            projectCharterId: pendingLink,
          })
        }
        if (pendingUnlink && constraint.projectCharter) {
          await unlinkFromProjectCharter.mutateAsync({
            constraintId: constraint.id,
            projectCharterId: constraint.projectCharter.id,
          })
        }
      },
    }))

    const hasCharter = (constraint.projectCharter && !pendingUnlink) || !!pendingLink
    const pcLabel = t('features.planningObjects.constraints.projectCharter')
    const pcOptionLabel = projectCharter?.project?.name
      ? `${pcLabel} — ${projectCharter.project.name}`
      : pcLabel

    const projectCharterOptions: ComboboxOption[] =
      projectCharter && !hasCharter ? [{ value: projectCharter.id, label: pcOptionLabel }] : []

    return (
      <div className="flex flex-col gap-6">
        {/* Section 1 — Project Charter */}
        <section aria-label={pcLabel}>
          <h3 className="text-foreground mb-2 text-sm font-medium">{pcLabel}</h3>

          {hasCharter ? (
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={cn('flex items-center gap-1', pendingLink && 'opacity-70')}
              >
                <span>{pcLabel}</span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t('shared.linksPanel.removeAriaLabel', { name: pcLabel })}
                    className="focus-visible:ring-ring ml-1 rounded-sm outline-none focus-visible:ring-2"
                    onClick={() => {
                      if (pendingLink) {
                        setPendingLink(null)
                      } else {
                        setPendingUnlink(true)
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
                onChange={(value) => value && setPendingLink(value)}
                placeholder={t('shared.combobox.placeholder')}
                searchPlaceholder={t('shared.combobox.searchPlaceholder')}
                noResultsText={t('shared.combobox.noResults')}
              />
            )
          )}
        </section>
      </div>
    )
  },
)
