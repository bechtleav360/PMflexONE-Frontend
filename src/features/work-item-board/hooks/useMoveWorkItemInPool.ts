import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WORK_ITEMS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { moveWorkItem } from '../api/boardMutationApi'

/**
 * Mutation hook to reorder a work item in the active pool (unassigned items).
 * Uses the new moveWorkItem API with targetColumnId=null and afterWorkItemId for insertion.
 * Invalidates the work-items query on settle so the pool re-sorts by the new server-side position.
 * @param scopeType - Scope type for cache invalidation.
 * @param scopeId - Scope ID for cache invalidation.
 * @param opts - Optional callbacks.
 * @param opts.onSettled - Called after the mutation settles (success or error).
 * @returns A TanStack Query mutation object.
 */
export function useMoveWorkItemInPool(
  scopeType: ScopeType,
  scopeId: string,
  opts?: { onSettled?: () => void },
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      workItemId,
      version,
      afterWorkItemId,
    }: {
      workItemId: string
      version: number
      afterWorkItemId: string | null
    }) => moveWorkItem(workItemId, { version, targetColumnId: null, afterWorkItemId }),

    onError: (err) => {
      const gqlMessage = err instanceof ClientError ? err.response.errors?.[0]?.message : undefined
      toast.error(
        gqlMessage ?? t('features.workItem.moveError', 'Failed to reorder task. Please try again.'),
      )
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) })
      opts?.onSettled?.()
    },
  })
}
