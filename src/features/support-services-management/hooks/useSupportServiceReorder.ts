import { useCallback, useRef, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { showError } from '@/shared/components/Toast/toastApi'

import type { SupportService } from '../types/supportService.types'
import { useMoveSupportService } from './useMoveSupportService'

// ─── Module-level helpers (not exported) ──────────────────────────────────────

/**
 * Returns the parent ID of a support service, or `null` for root nodes.
 *
 * @param s - The support service to inspect.
 * @returns The parent node ID, or `null` for root-level support services.
 */
function getParentId(s: SupportService): string | null {
  return s.parent?.node.id ?? null
}

/**
 * Returns siblings of a parent in ascending position order.
 *
 * @param flat - Full flat support service list.
 * @param parentId - Parent node ID, or `null` for root-level siblings.
 * @returns Sorted sibling array.
 */
function getSiblings(flat: SupportService[], parentId: string | null): SupportService[] {
  return flat.filter((s) => getParentId(s) === parentId).sort((a, b) => a.position - b.position)
}

/**
 * Walks the ancestor chain of `overItem` until it reaches the same parent
 * level as the active item, resolving the correct drop target.
 *
 * @param overItem - The node reported by `closestCenter` as the drop target.
 * @param activeParentId - The parent ID of the item being dragged.
 * @param flat - Full flat support service list.
 * @returns The resolved ancestor at the same level, or `null` if none found.
 */
function resolveDropAncestor(
  overItem: SupportService,
  activeParentId: string | null,
  flat: SupportService[],
): SupportService | null {
  let resolved = overItem
  while (getParentId(resolved) !== activeParentId) {
    const parentId = getParentId(resolved)
    if (parentId === null) return null
    const parent = flat.find((s) => s.id === parentId)
    if (!parent) return null
    resolved = parent
  }
  return resolved
}

/**
 * Computes the final insertion index after the active item is removed from
 * its old sibling group and inserted near the resolved ancestor.
 *
 * @param oldIndex - Current 0-based position of the dragged item.
 * @param ancestorIndex - Position of the resolved drop target.
 * @param isCrossDrop - Whether the cursor landed on a non-sibling node.
 * @returns The new 0-based insertion index.
 */
function computeNewPosition(oldIndex: number, ancestorIndex: number, isCrossDrop: boolean): number {
  if (!isCrossDrop) return ancestorIndex
  return oldIndex > ancestorIndex ? ancestorIndex + 1 : ancestorIndex
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all reorder business logic for the support services tree.
 *
 * Provides keyboard move handlers (`handleMoveUp`, `handleMoveDown`) and the
 * drag-and-drop handler (`handleDragEnd`). All three delegate to
 * `useMoveSupportService` and surface errors via toast.
 *
 * @param projectId - Scopes the mutation and cache invalidation.
 * @param flat - Current flat support service list (used to resolve siblings).
 * @returns Object with `handleMoveUp`, `handleMoveDown`, `handleDragEnd`,
 *   and `moveAnnouncement` (SR live-region string, or `null` when silent).
 */
// eslint-disable-next-line max-lines-per-function -- three tightly-coupled move handlers share state; extraction would require threading flat+mutation through additional props
export function useSupportServiceReorder(
  projectId: string,
  flat: SupportService[],
): {
  handleMoveUp: (id: string) => void
  handleMoveDown: (id: string) => void
  handleDragEnd: (event: DragEndEvent) => void
  moveAnnouncement: string | null
} {
  const { t } = useTranslation()
  const moveMutation = useMoveSupportService(projectId)
  const invalidMsg = t('features.supportServicesManagement.accessibility.invalidPosition')

  // SR live-region text — set on invalid/blocked moves, cleared after announcement
  const [moveAnnouncement, setMoveAnnouncement] = useState<string | null>(null)

  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const announce = useCallback((msg: string) => {
    // Toggle via null so the same message re-triggers assistive technology
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
    setMoveAnnouncement(null)
    announceTimerRef.current = setTimeout(() => {
      setMoveAnnouncement(msg)
    }, 0)
  }, [])

  const handleMoveUp = useCallback(
    (id: string) => {
      if (moveMutation.isPending) return

      const item = flat.find((f) => f.id === id)
      if (!item) return
      const siblings = getSiblings(flat, getParentId(item))
      const currentIndex = siblings.findIndex((s) => s.id === id)
      if (currentIndex <= 0) {
        announce(invalidMsg)
        return
      }

      void moveMutation
        .mutateAsync({
          id,
          input: {
            version: item.version,
            parentId: getParentId(item),
            position: currentIndex - 1,
          },
        })
        .catch(() => {
          showError(t('features.supportServicesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t, announce, invalidMsg],
  )

  const handleMoveDown = useCallback(
    (id: string) => {
      if (moveMutation.isPending) return

      const item = flat.find((f) => f.id === id)
      if (!item) return
      const siblings = getSiblings(flat, getParentId(item))
      const currentIndex = siblings.findIndex((s) => s.id === id)
      if (currentIndex < 0 || currentIndex >= siblings.length - 1) {
        announce(invalidMsg)
        return
      }

      void moveMutation
        .mutateAsync({
          id,
          input: {
            version: item.version,
            parentId: getParentId(item),
            position: currentIndex + 1,
          },
        })
        .catch(() => {
          showError(t('features.supportServicesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t, announce, invalidMsg],
  )

  const handleDragEnd = useCallback(
    // eslint-disable-next-line complexity -- guard + ancestor resolution + sibling index lookup are inherently sequential; splitting adds indirection without reducing actual complexity
    (event: DragEndEvent) => {
      if (moveMutation.isPending) return

      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = String(active.id)
      const overId = String(over.id)
      const activeItem = flat.find((s) => s.id === activeId)
      const overItemInitial = flat.find((s) => s.id === overId)
      if (!activeItem || !overItemInitial) return

      const activeParentId = getParentId(activeItem)
      const isCrossDrop = getParentId(overItemInitial) !== activeParentId
      const resolvedOver = resolveDropAncestor(overItemInitial, activeParentId, flat)
      if (!resolvedOver || resolvedOver.id === activeId) return

      const siblings = getSiblings(flat, activeParentId)
      const oldIndex = siblings.findIndex((s) => s.id === activeId)
      const ancestorIndex = siblings.findIndex((s) => s.id === resolvedOver.id)
      if (oldIndex === -1 || ancestorIndex === -1) return

      const newIndex = computeNewPosition(oldIndex, ancestorIndex, isCrossDrop)
      if (oldIndex === newIndex) return

      void moveMutation
        .mutateAsync({
          id: activeId,
          input: {
            version: activeItem.version,
            parentId: activeParentId,
            position: newIndex,
          },
        })
        .catch(() => {
          showError(t('features.supportServicesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t],
  )

  return { handleMoveUp, handleMoveDown, handleDragEnd, moveAnnouncement }
}
