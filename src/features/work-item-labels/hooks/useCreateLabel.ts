import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { LABELS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { createLabel, type CreateLabelArgs } from '../api/labelMutationApi'

/**
 * Mutation hook to create a label in a scope. Invalidates the labels query on success.
 * @param scopeType - The scope type (e.g. 'Project').
 * @param scopeId - The ID of the scope.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateLabel(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (args: CreateLabelArgs) => createLabel(args),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY(scopeType, scopeId) })
    },
    onError: () => {
      toast.error(t('features.workItemLabels.createError', 'Failed to create label.'))
    },
  })
}
