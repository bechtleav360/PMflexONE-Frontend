import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BOARD_CACHE_PREFIX,
  CHANGE_HISTORY_QUERY_KEY,
  WORK_ITEM_QUERY_KEY,
  WORK_ITEMS_QUERY_KEY,
} from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { addLabelToWorkItem, removeLabelFromWorkItem } from '../api/labelMutationApi'

/**
 * Mutation hook to add a label to a work item. Invalidates the work items query on success.
 *
 * @param scopeType - Type of the scope (e.g. `'project'`).
 * @param scopeId - ID of the scope owning the work item.
 * @returns A TanStack mutation object for the add-label operation.
 */
export function useAddLabelToWorkItem(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ workItemId, labelId }: { workItemId: string; labelId: string }) =>
      addLabelToWorkItem(workItemId, labelId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.workItemId) }),
        queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', variables.workItemId),
        }),
      ])
    },
    onError: () => {
      toast.error(t('features.workItemLabels.addError', 'Failed to add label.'))
    },
  })
}

/**
 * Mutation hook to remove a label from a work item. Invalidates the work items query on success.
 *
 * @param scopeType - Type of the scope (e.g. `'project'`).
 * @param scopeId - ID of the scope owning the work item.
 * @returns A TanStack mutation object for the remove-label operation.
 */
export function useRemoveLabelFromWorkItem(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ workItemId, labelId }: { workItemId: string; labelId: string }) =>
      removeLabelFromWorkItem(workItemId, labelId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.workItemId) }),
        queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', variables.workItemId),
        }),
      ])
    },
    onError: () => {
      toast.error(t('features.workItemLabels.removeError', 'Failed to remove label.'))
    },
  })
}
