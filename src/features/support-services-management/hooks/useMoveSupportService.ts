import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  MOVE_SUPPORT_SERVICE,
  moveSupportServiceResponseSchema,
  SUPPORT_SERVICE_KEY,
  SUPPORT_SERVICES_KEY,
} from '../api/supportServicesApi'
import { useSupportServicesUiStore } from '../store/supportServicesUiStore'
import type { SupportService, SupportServiceTreeNode } from '../types/supportService.types'
import { buildSupportServiceTree } from '../utils/buildSupportServiceTree'

/**
 * Input for the `MoveSupportService` mutation.
 *
 * @property version - Optimistic-lock version of the support service being moved.
 * @property parentId - New parent ID, or `null` to move to root level.
 * @property position - New 0-based position within the target parent's children.
 */
export interface MoveSupportServiceInput {
  version: number
  parentId?: string | null
  position: number
}

/**
 * Applies a move operation locally on the flat support service list.
 *
 * Mirrors the backend logic: removes the item from its old sibling group
 * (renumbering remaining siblings), then inserts it at the requested position
 * in the new sibling group.
 *
 * @param flat - Current flat list of support services.
 * @param id - ID of the support service to move.
 * @param input - Move parameters.
 * @returns A new flat list with updated positions.
 */
// eslint-disable-next-line complexity -- sequential 4-step tree-reorder algorithm; splitting would fragment interdependent sibling arrays and offer no clarity benefit
function applyOptimisticMove(
  flat: SupportService[],
  id: string,
  input: MoveSupportServiceInput,
): SupportService[] {
  const target = flat.find((s) => s.id === id)
  if (!target) return flat

  const oldParentId = target.parent?.node.id ?? null
  const newParentId = 'parentId' in input ? (input.parentId ?? null) : oldParentId

  // Mutable shallow copies
  const items = flat.map((s) => ({ ...s }))

  // Step 1: Remove target from old sibling group and renumber
  const oldSiblings = items
    .filter((s) => s.id !== id && (s.parent?.node.id ?? null) === oldParentId)
    .sort((a, b) => a.position - b.position)
  oldSiblings.forEach((sib, i) => {
    const item = items.find((s) => s.id === sib.id)
    if (item) item.position = i
  })

  // Step 2: Insert target into new sibling group at requested position
  const newSiblings = items
    .filter((s) => s.id !== id && (s.parent?.node.id ?? null) === newParentId)
    .sort((a, b) => a.position - b.position)

  const clampedPos = Math.max(0, Math.min(input.position, newSiblings.length))
  const targetItem = items.find((s) => s.id === id)
  if (targetItem) newSiblings.splice(clampedPos, 0, targetItem)

  newSiblings.forEach((sib, i) => {
    const item = items.find((s) => s.id === sib.id)
    if (item) item.position = i
  })

  // Step 3: Update target's parent edge and position
  const movedItem = items.find((s) => s.id === id)
  if (movedItem) {
    const newParentService = newParentId ? flat.find((s) => s.id === newParentId) : null
    movedItem.parent = newParentService
      ? { node: { id: newParentService.id, name: newParentService.name } }
      : null
    movedItem.position = clampedPos
  }

  // Step 4: Update raw children edges on old and new parents so the list view's
  // `row.children.length > 0` check reflects the new structure during the
  // optimistic window (avoids showing the wrong delete-dialog variant).
  if (oldParentId !== newParentId) {
    const oldParentItem = items.find((s) => s.id === oldParentId)
    if (oldParentItem) {
      oldParentItem.children = oldParentItem.children.filter((c) => c.node.id !== id)
    }
    const newParentItem = newParentId ? items.find((s) => s.id === newParentId) : null
    if (newParentItem) {
      newParentItem.children = [...newParentItem.children, { node: { id } }]
    }
  }

  return items
}

/**
 * Mutation hook for reordering a support service within the tree.
 *
 * Applies an optimistic update immediately so the UI reflects the new order
 * without waiting for the server round-trip. Rolls back on error.
 *
 * @param projectId - The project ID — used to scope cache keys.
 * @returns A TanStack Query mutation object.
 */
export function useMoveSupportService(projectId: string) {
  const queryClient = useQueryClient()
  const treeKey = SUPPORT_SERVICES_KEY(projectId)

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: MoveSupportServiceInput }) => {
      const raw = await graphqlClient.request(MOVE_SUPPORT_SERVICE, {
        id,
        version: input.version,
        parentId: input.parentId ?? null,
        position: input.position,
      })
      return moveSupportServiceResponseSchema.parse(raw).moveSupportService
    },

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: treeKey })

      const previous = queryClient.getQueryData<{
        tree: SupportServiceTreeNode[]
        flat: SupportService[]
      }>(treeKey)

      if (previous) {
        const newFlat = applyOptimisticMove(previous.flat, id, input)
        const newTree = buildSupportServiceTree(newFlat)
        queryClient.setQueryData(treeKey, { tree: newTree, flat: newFlat })
      }

      // Clear the drag overlay in the same synchronous call so React 18 batches
      // setQueryData + setActiveDragId into a single render — no flash at old position.
      useSupportServicesUiStore.getState().setActiveDragId(null)

      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(treeKey, context.previous)
      }
    },

    onSettled: (_data, _err, { id }) => {
      void queryClient.invalidateQueries({ queryKey: treeKey })
      // Bust the single-item cache so the edit form reads the new version.
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICE_KEY(id) })
    },
  })
}
