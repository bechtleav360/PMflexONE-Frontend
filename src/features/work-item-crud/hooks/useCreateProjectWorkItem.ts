import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WORK_ITEMS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { createProjectWorkItem, type CreateProjectWorkItemInput } from '../api/workItemMutationApi'

/**
 * Mutation hook to create a new work item in a scope. Invalidates the work items list on success.
 * @param scopeType - The scope type (e.g. 'Project').
 * @param scopeId - The ID of the scope.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateProjectWorkItem(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: { input: CreateProjectWorkItemInput }) =>
      createProjectWorkItem(payload.input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId),
      })
      toast.success(
        t('features.workItem.createSuccess', {
          name: data.name,
          defaultValue: 'Task "{{name}}" created.',
        }),
      )
      const allKeys = queryClient.getQueryCache().findAll({ queryKey: ['workItems'] })
      if (
        allKeys.some(
          (q) => Array.isArray(q.state.data) && (q.state.data as unknown[]).length >= 500,
        )
      ) {
        toast.warning(t('pages.taskManagement.softLimit'))
      }
    },
  })
}
