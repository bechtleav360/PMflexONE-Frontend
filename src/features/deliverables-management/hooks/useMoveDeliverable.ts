import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELIVERABLE_KEY,
  DELIVERABLES_TREE_KEY,
  MOVE_DELIVERABLE,
  moveDeliverableResponseSchema,
} from '../api/deliverablesApi'
import { useDeliverablesUiStore } from '../store/deliverablesUiStore'
import type { Deliverable, DeliverableTreeNode } from '../types/deliverable.types'
import { buildDeliverableTree } from '../utils/buildDeliverableTree'

/**
 * Input for the `MoveDeliverable` mutation.
 *
 * @property version - Optimistic-lock version of the deliverable being moved.
 * @property newParentId - New parent ID, or `null` / omit to keep/move to root level.
 * @property newPosition - New 0-based position within the target parent's children.
 */
export interface MoveDeliverableInput {
  version: number
  newParentId?: string | null
  newPosition: number
}

/**
 * Applies a move operation locally on the flat deliverable list.
 *
 * Mirrors the backend logic: removes the item from its old sibling group
 * (renumbering remaining siblings), then inserts it at the requested position
 * in the new sibling group.
 *
 * @param flat - Current flat list of deliverables.
 * @param id - ID of the deliverable to move.
 * @param input - Move parameters (matches `MoveDeliverableInput`).
 * @returns A new flat list with updated positions.
 */
function applyOptimisticMove(
  flat: Deliverable[],
  id: string,
  input: MoveDeliverableInput,
): Deliverable[] {
  const target = flat.find((d) => d.id === id)
  if (!target) return flat

  const oldParentId = target.parent?.node.id ?? null
  const newParentId = 'newParentId' in input ? (input.newParentId ?? null) : oldParentId

  // Mutable shallow copies
  const items = flat.map((d) => ({ ...d }))

  // Step 1: Remove target from old sibling group and renumber
  const oldSiblings = items
    .filter((d) => d.id !== id && (d.parent?.node.id ?? null) === oldParentId)
    .sort((a, b) => a.position - b.position)
  oldSiblings.forEach((s, i) => {
    const item = items.find((d) => d.id === s.id)
    if (item) item.position = i
  })

  // Step 2: Insert target into new sibling group at requested position
  const newSiblings = items
    .filter((d) => d.id !== id && (d.parent?.node.id ?? null) === newParentId)
    .sort((a, b) => a.position - b.position)

  const clampedPos = Math.max(0, Math.min(input.newPosition, newSiblings.length))
  const targetItem = items.find((d) => d.id === id)
  if (targetItem) newSiblings.splice(clampedPos, 0, targetItem)

  newSiblings.forEach((s, i) => {
    const item = items.find((d) => d.id === s.id)
    if (item) item.position = i
  })

  // Step 3: Update target's parent edge and position
  const movedItem = items.find((d) => d.id === id)
  if (movedItem) {
    const newParentDeliverable = newParentId ? flat.find((d) => d.id === newParentId) : null
    movedItem.parent = newParentDeliverable
      ? { node: { id: newParentDeliverable.id, name: newParentDeliverable.name } }
      : null
    movedItem.position = clampedPos
  }

  return items
}

/**
 * Mutation hook for reordering a deliverable within the tree.
 *
 * Applies an optimistic update immediately so the UI reflects the new order
 * without waiting for the server round-trip. Rolls back on error.
 *
 * @param projectId - The project ID — used to scope cache keys.
 * @returns A TanStack Query mutation object.
 */
export function useMoveDeliverable(projectId: string) {
  const queryClient = useQueryClient()
  const treeKey = DELIVERABLES_TREE_KEY(projectId)

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: MoveDeliverableInput }) => {
      const raw = await graphqlClient.request(MOVE_DELIVERABLE, { id, input })
      return moveDeliverableResponseSchema.parse(raw).moveDeliverable
    },

    onMutate: ({ id, input }) => {
      // Cancel in-flight queries without blocking — we apply the optimistic
      // update synchronously so it batches with setActiveDragId(null) in
      // one React render, preventing the ghost snap-back flash.
      void queryClient.cancelQueries({ queryKey: treeKey })

      const previous = queryClient.getQueryData<{
        tree: DeliverableTreeNode[]
        flat: Deliverable[]
      }>(treeKey)

      if (previous) {
        const newFlat = applyOptimisticMove(previous.flat, id, input)
        const newTree = buildDeliverableTree(newFlat)
        queryClient.setQueryData(treeKey, { tree: newTree, flat: newFlat })
      }

      // Clear the drag overlay in the same synchronous call so React 18 batches
      // setQueryData + setActiveDragId into a single render — no flash at old position.
      useDeliverablesUiStore.getState().setActiveDragId(null)

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(treeKey, context.previous)
      }
    },

    onSettled: (_data, _err, { id }) => {
      void queryClient.invalidateQueries({ queryKey: treeKey })
      // Also bust the single-item cache so the edit form reads the new version.
      // Without this, opening the modal after a move sends a stale version → conflict.
      void queryClient.invalidateQueries({ queryKey: DELIVERABLE_KEY(id) })
    },
  })
}
