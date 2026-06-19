import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  BOARD_CACHE_PREFIX,
  CHANGE_HISTORY_QUERY_KEY,
  WORK_ITEM_QUERY_KEY,
} from '@/entities/work-item'

import { archiveWorkItem, unarchiveWorkItem } from '../api/workItemMutationApi'

/**
 * Mutation hook to archive a work item. Invalidates work item, list, and board queries on success.
 * @returns A TanStack Query mutation object for archiving a work item.
 */
export function useArchiveWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => archiveWorkItem(id, version),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['workItems'] }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', variables.id),
        }),
      ])
    },
  })
}

/**
 * Mutation hook to unarchive a work item. Invalidates work item, list, and board queries on success.
 * @returns A TanStack Query mutation object for unarchiving a work item.
 */
export function useUnarchiveWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      unarchiveWorkItem(id, version),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['workItems'] }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', variables.id),
        }),
      ])
    },
  })
}
