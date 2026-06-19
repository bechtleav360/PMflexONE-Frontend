import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BOARD_QUERY_KEY,
  WORK_ITEMS_QUERY_KEY,
  type Board,
  type ProjectWorkItem,
  type WorkItem,
} from '@/entities/work-item'
import { extractGqlErrorMessage } from '@/shared/lib/gqlError'
import type { ScopeType } from '@/shared/types/scopeType'

import { assignWorkItemToColumn } from '../api/boardMutationApi'

function isVersionConflictMessage(msg: string): boolean {
  const lower = msg.toLowerCase()
  return lower.includes('version') || lower.includes('conflict') || lower.includes('modified')
}

function showAssignColumnErrorToast(err: unknown, t: ReturnType<typeof useTranslation>['t']): void {
  const gqlMessage = extractGqlErrorMessage(err)
  if (gqlMessage && isVersionConflictMessage(gqlMessage)) {
    toast.error(
      t(
        'features.workItem.optimisticLockConflict',
        'Item was modified by someone else. Please reload and retry.',
      ),
    )
  } else if (gqlMessage) {
    toast.error(gqlMessage)
  } else {
    toast.error(t('features.workItem.assignColumnError', 'Failed to move task. Please try again.'))
  }
}

/**
 * Mutation hook to move a work item to a board column with optimistic UI update.
 * @param boardId - ID of the board being mutated (used for cache updates).
 * @param scopeType - Scope type used to invalidate the work-items query on settle.
 * @param scopeId - Scope ID used to invalidate the work-items query on settle.
 * @param opts - Optional hook configuration.
 * @param opts.suppressErrorToast - When true, skips the error toast (use for best-effort auto-assign after creation).
 * @returns A TanStack Query mutation object for assigning a work item to a column.
 */
export function useAssignWorkItemToColumn(
  boardId: string,
  scopeType: ScopeType,
  scopeId: string,
  opts?: { suppressErrorToast?: boolean },
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      workItemId,
      boardColumnId,
      version,
    }: {
      workItemId: string
      boardColumnId: string
      version: number
      insertBeforeWorkItemId?: string | null
    }) => assignWorkItemToColumn(workItemId, boardColumnId, version),

    onMutate: async ({ workItemId, boardColumnId, insertBeforeWorkItemId }) => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
      const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY(boardId))

      if (previousBoard) {
        const allColumnItems = previousBoard.columns.flatMap((c) => c.workItems ?? [])
        const workItemsEntries = queryClient.getQueriesData<WorkItem[]>({ queryKey: ['workItems'] })
        const workItemsCache = workItemsEntries.flatMap(([, data]) => data ?? [])
        const movingItem = (allColumnItems.find((wi) => wi.id === workItemId) ??
          workItemsCache.find((wi) => wi.id === workItemId)) as ProjectWorkItem | undefined

        const updatedColumns = previousBoard.columns.map((col) => {
          const filteredItems = (col.workItems ?? []).filter((wi) => wi.id !== workItemId)
          if (col.id === boardColumnId && movingItem) {
            if (insertBeforeWorkItemId) {
              const insertIdx = filteredItems.findIndex((wi) => wi.id === insertBeforeWorkItemId)
              const spliced = [...filteredItems]
              spliced.splice(insertIdx === -1 ? spliced.length : insertIdx, 0, movingItem)
              return { ...col, workItems: spliced }
            }
            return { ...col, workItems: [...filteredItems, movingItem] }
          }
          return { ...col, workItems: filteredItems }
        })
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

      if (opts?.suppressErrorToast) return

      showAssignColumnErrorToast(err, t)
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) }),
        queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) }),
      ])
    },
  })
}
