import { useCallback, useEffect, useRef, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import { showError } from '@/shared/components/Toast/toastApi'

import type { Deliverable } from '../types/deliverable.types'
import { useMoveDeliverable } from './useMoveDeliverable'

// ─── Module-level helpers (not exported) ──────────────────────────────────────

/**
 * Returns the parent ID of a deliverable, or `null` for root nodes.
 *
 * @param d - The deliverable to inspect.
 * @returns The parent node ID, or `null` for root-level deliverables.
 */
function getParentId(d: Deliverable): string | null {
  return d.parent?.node.id ?? null
}

/**
 * Returns siblings of a parent in ascending position order.
 *
 * @param flat - Full flat deliverable list.
 * @param parentId - Parent node ID, or `null` for root-level siblings.
 * @returns Sorted sibling array.
 */
function getSiblings(flat: Deliverable[], parentId: string | null): Deliverable[] {
  return flat.filter((d) => getParentId(d) === parentId).sort((a, b) => a.position - b.position)
}

/**
 * Walks the ancestor chain of `overItem` until it reaches the same parent
 * level as the active item, resolving the correct drop target.
 *
 * Needed because `closestCenter` can return a child of a sibling when the
 * cursor hovers near the boundary between the last visible child and the
 * next sibling.
 *
 * @param overItem - The node reported by `closestCenter` as the drop target.
 * @param activeParentId - The parent ID of the item being dragged.
 * @param flat - Full flat deliverable list.
 * @returns The resolved ancestor at the same level, or `null` if none found.
 */
function resolveDropAncestor(
  overItem: Deliverable,
  activeParentId: string | null,
  flat: Deliverable[],
): Deliverable | null {
  let resolved = overItem
  while (getParentId(resolved) !== activeParentId) {
    const parentId = getParentId(resolved)
    if (parentId === null) return null
    const parent = flat.find((d) => d.id === parentId)
    if (!parent) return null
    resolved = parent
  }
  return resolved
}

/**
 * Computes the final insertion index after the active item is removed from
 * its old sibling group and inserted near the resolved ancestor.
 *
 * For cross-subtree drops the active item's removal shifts later siblings:
 * - active was BELOW ancestor → ancestor index unchanged → insert at `ancestorIndex + 1`
 * - active was ABOVE ancestor → ancestor shifts down → insert at `ancestorIndex`
 * For direct-sibling drops the existing swap behaviour is preserved.
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
 * Encapsulates all reorder business logic for the deliverables tree.
 *
 * Provides keyboard move handlers (`handleMoveUp`, `handleMoveDown`) and the
 * drag-and-drop handler (`handleDragEnd`). All three delegate to
 * `useMoveDeliverable` and surface errors via toast.
 *
 * Move operations are blocked while a mutation is in-flight to prevent
 * optimistic-concurrency version conflicts that arise when rapid successive
 * moves fire with the same stale version number.
 *
 * @param projectId - Scopes the mutation and cache invalidation.
 * @param flat - Current flat deliverable list (used to resolve siblings).
 * @returns Object with `handleMoveUp`, `handleMoveDown`, `handleDragEnd`,
 *   and `moveAnnouncement` (SR live-region string, or `null` when silent).
 */
// eslint-disable-next-line max-lines-per-function -- encapsulates three interdependent handlers (moveUp, moveDown, dragEnd) that share sibling-resolution logic; splitting would require threading the same flat list through multiple hooks
export function useDeliverableReorder(
  projectId: string,
  flat: Deliverable[],
): {
  handleMoveUp: (id: string) => void
  handleMoveDown: (id: string) => void
  handleDragEnd: (event: DragEndEvent) => void
  moveAnnouncement: string | null
} {
  const { t } = useTranslation()
  const moveMutation = useMoveDeliverable(projectId)
  const invalidMsg = t('features.deliverablesManagement.accessibility.invalidPosition')

  // SR live-region text — set on invalid/blocked moves, cleared after announcement
  const [moveAnnouncement, setMoveAnnouncement] = useState<string | null>(null)
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (announceTimerRef.current !== null) clearTimeout(announceTimerRef.current)
    },
    [],
  )

  const announce = useCallback((msg: string) => {
    // Toggle via null so the same message re-triggers assistive technology
    if (announceTimerRef.current !== null) clearTimeout(announceTimerRef.current)
    setMoveAnnouncement(null)
    announceTimerRef.current = setTimeout(() => {
      setMoveAnnouncement(msg)
    }, 0)
  }, [])

  const handleMoveUp = useCallback(
    (id: string) => {
      // Block while a move is already in-flight — prevents version conflicts
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
            newParentId: getParentId(item),
            newPosition: currentIndex - 1,
          },
        })
        .catch(() => {
          showError(t('features.deliverablesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t, announce, invalidMsg],
  )

  const handleMoveDown = useCallback(
    (id: string) => {
      // Block while a move is already in-flight — prevents version conflicts
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
            newParentId: getParentId(item),
            newPosition: currentIndex + 1,
          },
        })
        .catch(() => {
          showError(t('features.deliverablesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t, announce, invalidMsg],
  )

  const handleDragEnd = useCallback(
    // eslint-disable-next-line complexity -- handles all DnD edge cases (no over target, no position change, reorder vs. cross-parent move) in one place; each branch is a distinct guard that would lose clarity if extracted
    (event: DragEndEvent) => {
      // Block while a move is already in-flight — prevents version conflicts
      if (moveMutation.isPending) return

      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = String(active.id)
      const overId = String(over.id)
      const activeItem = flat.find((d) => d.id === activeId)
      const overItemInitial = flat.find((d) => d.id === overId)
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
            newParentId: activeParentId,
            newPosition: newIndex,
          },
        })
        .catch(() => {
          showError(t('features.deliverablesManagement.toast.saveFailed'))
        })
    },
    [flat, moveMutation, t],
  )

  return { handleMoveUp, handleMoveDown, handleDragEnd, moveAnnouncement }
}
