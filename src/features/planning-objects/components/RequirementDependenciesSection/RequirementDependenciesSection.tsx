import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import { Combobox } from '@/shared/components/Combobox'
import type { ComboboxOption } from '@/shared/components/Combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/Select'

import { REQUIREMENT_QUERY_KEY } from '../../api/requirementApi'
import { useLinkRequirements } from '../../hooks/useLinkRequirements'
import { useRequirements } from '../../hooks/useRequirements'
import { useUnlinkRequirements } from '../../hooks/useUnlinkRequirements'
import type { RequirementDependency } from '../../types/requirement.types'
import { DEPENDENCY_TYPE_LABELS } from '../../utils/enumConstants'
import { deriveCanonicalLinkType } from './deriveCanonicalLinkType'

type DepType = 'blocks' | 'duplicates' | 'relates_to'

/** Staged add — shown optimistically, flushed on save. */
interface StagedLink {
  toId: string
  requirementName: string
  linkType: DepType
}

/** Staged remove — pre-computed mutation args, flushed on save. */
interface StagedUnlink {
  /** Unique key matching `depKey()` of the original dependency. */
  key: string
  fromId: string
  toId: string
  linkType: DepType
}

function depKey(dep: RequirementDependency): string {
  return `${dep.edgeTypeName}::${dep.requirement.id}`
}

/** Imperative handle exposed by {@link RequirementDependenciesSection}. */
export interface RequirementDependenciesSectionHandle {
  /**
   * Flushes all staged link/unlink operations to the backend.
   * Call this before the parent form's submit handler persists.
   */
  flush: () => Promise<void>
}

/** Props for {@link RequirementDependenciesSection}. */
export interface RequirementDependenciesSectionProps {
  /** ID of the requirement being edited. */
  requirementId: string
  /** Optimistic-lock version of the requirement. */
  requirementVersion: number
  /** Current dependency edges from the requirement detail. */
  dependencies: RequirementDependency[]
  /** Project scope ID used to search for requirements. */
  scopeId: string
  /** When true, hides remove buttons and the add controls. */
  readOnly?: boolean
  /** Called whenever the dirty state of this section changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Renders the dependencies section of the requirement edit form.
 *
 * Changes (adds and removes) are staged locally and only persisted to the
 * backend when the parent form calls {@link RequirementDependenciesSectionHandle.flush}
 * via the forwarded ref before submitting.
 *
 * @param props - Component props.
 * @param props.requirementId - ID of the requirement being edited.
 * @param props.dependencies - Current persisted dependency edges.
 * @param props.scopeId - Project scope ID for searching requirements.
 * @param ref - Ref exposing the `flush()` imperative handle.
 * @returns The rendered dependencies section.
 */
export const RequirementDependenciesSection = forwardRef<
  RequirementDependenciesSectionHandle,
  RequirementDependenciesSectionProps
>(
  // eslint-disable-next-line max-lines-per-function -- tree/link-section component; line count driven by render structure and state handlers
  function RequirementDependenciesSection(
    {
      requirementId,
      dependencies,
      scopeId,
      readOnly = false,
      onDirtyChange,
    }: RequirementDependenciesSectionProps,
    ref,
  ) {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null)
    const [selectedLinkType, setSelectedLinkType] = useState<DepType>('relates_to')
    const [pendingLinks, setPendingLinks] = useState<StagedLink[]>([])
    const [pendingUnlinks, setPendingUnlinks] = useState<StagedUnlink[]>([])

    useEffect(() => {
      onDirtyChange?.(pendingLinks.length > 0 || pendingUnlinks.length > 0)
    }, [pendingLinks.length, pendingUnlinks.length, onDirtyChange])

    const { data: allRequirements = [] } = useRequirements('Project', scopeId)
    const linkRequirements = useLinkRequirements()
    const unlinkRequirements = useUnlinkRequirements()

    useImperativeHandle(ref, () => ({
      flush: async () => {
        const linkPromises = pendingLinks.map(({ toId, linkType }) =>
          linkRequirements.mutateAsync({ fromId: requirementId, toId, linkType }),
        )
        const unlinkPromises = pendingUnlinks.map(({ fromId, toId, linkType }) =>
          unlinkRequirements.mutateAsync({ fromId, toId, linkType }),
        )
        await Promise.all([...linkPromises, ...unlinkPromises])
        if (linkPromises.length > 0 || unlinkPromises.length > 0) {
          await queryClient.refetchQueries({
            queryKey: REQUIREMENT_QUERY_KEY(requirementId),
            type: 'all',
          })
        }
      },
    }))

    const pendingUnlinkKeys = new Set(pendingUnlinks.map((u) => u.key))
    const pendingLinkToIds = new Set(pendingLinks.map((l) => l.toId))

    // Persisted deps excluding staged removes
    const visiblePersistedDeps = dependencies.filter((dep) => !pendingUnlinkKeys.has(depKey(dep)))

    const hasAnyDeps = visiblePersistedDeps.length > 0 || pendingLinks.length > 0

    if (readOnly && !hasAnyDeps) return null

    // Exclude self, visible persisted deps, and staged additions from picker options.
    // Staged removals (pendingUnlinks) are intentionally NOT excluded so the user
    // can re-add a dependency they just removed before saving.
    const excludedIds = new Set([
      requirementId,
      ...visiblePersistedDeps.map((d) => d.requirement.id),
      ...pendingLinkToIds,
    ])
    const requirementOptions: ComboboxOption[] = allRequirements
      .filter((r) => !excludedIds.has(r.id))
      .map((r) => ({ value: r.id, label: r.name }))

    function handleAdd() {
      if (!selectedReqId) return
      const req = allRequirements.find((r) => r.id === selectedReqId)
      setPendingLinks((prev) => [
        ...prev,
        {
          toId: selectedReqId,
          requirementName: req?.name ?? selectedReqId,
          linkType: selectedLinkType,
        },
      ])
      setSelectedReqId(null)
    }

    function handleRemovePersisted(dep: RequirementDependency) {
      const canonical = deriveCanonicalLinkType(dep.edgeTypeName)
      // Reverse types: edge stored as (dep.requirement → currentReq), so swap direction
      const isReverse = dep.edgeTypeName === 'blocked_by' || dep.edgeTypeName === 'duplicated_by'
      const fromId = isReverse ? dep.requirement.id : requirementId
      const toId = isReverse ? requirementId : dep.requirement.id
      setPendingUnlinks((prev) => [
        ...prev,
        { key: depKey(dep), fromId, toId, linkType: canonical },
      ])
    }

    function handleRemovePending(link: StagedLink) {
      setPendingLinks((prev) => prev.filter((l) => l.toId !== link.toId))
    }

    return (
      <section
        aria-labelledby="req-deps-heading"
        className="flex flex-col gap-3"
      >
        <h3
          id="req-deps-heading"
          className="text-foreground text-sm font-medium"
        >
          {t('features.planningObjects.requirements.dep.sectionTitle')}
        </h3>

        {hasAnyDeps && (
          <ul
            className="flex flex-col gap-1"
            aria-label={t('features.planningObjects.requirements.dep.sectionTitle')}
          >
            {visiblePersistedDeps.map((dep) => (
              <li
                key={`${dep.edgeTypeName}-${dep.requirement.id}`}
                className="border-border flex items-center justify-between gap-2 rounded border px-3 py-1.5 text-sm"
              >
                <span>
                  <span className="text-muted-foreground">
                    {t(DEPENDENCY_TYPE_LABELS[dep.edgeTypeName])}{' '}
                  </span>
                  <span className="font-medium">{dep.requirement.name}</span>
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t('features.planningObjects.requirements.dep.removeAriaLabel', {
                      name: dep.requirement.name,
                    })}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
                    onClick={() => handleRemovePersisted(dep)}
                  >
                    <X
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </li>
            ))}
            {pendingLinks.map((link) => (
              <li
                key={`pending-${link.toId}`}
                className="border-border flex items-center justify-between gap-2 rounded border px-3 py-1.5 text-sm opacity-70"
              >
                <span>
                  <span className="text-muted-foreground">
                    {t(DEPENDENCY_TYPE_LABELS[link.linkType])}{' '}
                  </span>
                  <span className="font-medium">{link.requirementName}</span>
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={t('features.planningObjects.requirements.dep.removeAriaLabel', {
                      name: link.requirementName,
                    })}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
                    onClick={() => handleRemovePending(link)}
                  >
                    <X
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!readOnly && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Combobox
                options={requirementOptions}
                value={selectedReqId}
                onChange={setSelectedReqId}
                placeholder={t('features.planningObjects.requirements.dep.selectRequirement')}
                searchPlaceholder={t('features.planningObjects.requirements.dep.selectRequirement')}
                noResultsText={t('shared.combobox.noResults')}
              />
            </div>

            <Select
              value={selectedLinkType}
              onValueChange={(v) => setSelectedLinkType(v as DepType)}
            >
              <SelectTrigger
                className="w-48"
                aria-label={t('features.planningObjects.requirements.dep.selectLinkType')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocks">{t(DEPENDENCY_TYPE_LABELS['blocks'])}</SelectItem>
                <SelectItem value="duplicates">
                  {t(DEPENDENCY_TYPE_LABELS['duplicates'])}
                </SelectItem>
                <SelectItem value="relates_to">
                  {t(DEPENDENCY_TYPE_LABELS['relates_to'])}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="secondary"
              disabled={!selectedReqId}
              onClick={handleAdd}
            >
              {t('features.planningObjects.requirements.dep.addDependency')}
            </Button>
          </div>
        )}
      </section>
    )
  },
)
