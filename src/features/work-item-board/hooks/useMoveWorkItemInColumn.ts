import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BOARD_QUERY_KEY,
  WORK_ITEMS_QUERY_KEY,
  type Board,
  type ScopeType,
} from '@/entities/work-item'

import { moveWorkItem } from '../api/boardMutationApi'

/**
 * Mutation hook to move a work item within/between columns or to the active pool.
 * boardColumnId=null moves the item to the active pool (unassigns from column).
 * Accepts `afterWorkItemId` (place after this item; null = place at top) instead of a numeric position.
 * Applies an optimistic cache update immediately, then persists via the backend.
 * On error the cache is rolled back to the previous state.
 * @param boardId - ID of the board being mutated (used for cache key).
 * @param scopeType - Scope type for work-items cache invalidation (required when boardColumnId=null).
 * @param scopeId - Scope ID for work-items cache invalidation (required when boardColumnId=null).
 * @returns A TanStack Query mutation object.
 */
export function useMoveWorkItemInColumn(boardId: string, scopeType?: ScopeType, scopeId?: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      workItemId,
      version,
      boardColumnId,
      afterWorkItemId,
    }: {
      workItemId: string
      version: number
      boardColumnId: string | null
      afterWorkItemId: string | null
    }) => moveWorkItem(workItemId, { version, targetColumnId: boardColumnId, afterWorkItemId }),

    onMutate: async ({ workItemId, boardColumnId, afterWorkItemId }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY(boardId))

      if (previousBoard && boardColumnId !== null) {
        // Optimistic update for within-column or cross-column moves
        const updatedColumns = previousBoard.columns.map((col) => {
          if (col.id !== boardColumnId) return col
          const items = col.workItems ?? []
          const dragged = items.find((wi) => wi.id === workItemId)
          if (!dragged) return col
          const withoutDragged = items.filter((wi) => wi.id !== workItemId)
          const afterIdx = afterWorkItemId
            ? withoutDragged.findIndex((wi) => wi.id === afterWorkItemId)
            : -1
          const newItems = [...withoutDragged]
          newItems.splice(afterIdx + 1, 0, dragged)
          return { ...col, workItems: newItems }
        })
        queryClient.setQueryData(BOARD_QUERY_KEY(boardId), {
          ...previousBoard,
          columns: updatedColumns,
        })
      } else if (previousBoard && boardColumnId === null) {
        // Optimistic update: remove item from its current column
        const updatedColumns = previousBoard.columns.map((col) => ({
          ...col,
          workItems: (col.workItems ?? []).filter((wi) => wi.id !== workItemId),
        }))
        queryClient.setQueryData(BOARD_QUERY_KEY(boardId), {
          ...previousBoard,
          columns: updatedColumns,
        })
      }

      return { previousBoard }
    },

    onError: (err, _vars, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY(boardId), context.previousBoard)
      }
      const gqlMessage = err instanceof ClientError ? err.response.errors?.[0]?.message : undefined
      toast.error(
        gqlMessage ?? t('features.workItem.moveError', 'Failed to reorder task. Please try again.'),
      )
    },

    onSettled: (_data, _err, vars) => {
      void queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
      if (vars.boardColumnId === null && scopeType && scopeId) {
        void queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) })
      }
    },
  })
}
