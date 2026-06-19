import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BOARD_CACHE_PREFIX, LABELS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { updateLabel, type UpdateLabelArgs } from '../api/labelMutationApi'

/**
 * Mutation hook to update a label's name or color. Invalidates the labels query on success.
 * @param scopeType - The scope type (e.g. 'Project').
 * @param scopeId - The ID of the scope.
 * @returns TanStack Mutation result for the update operation.
 */
export function useUpdateLabel(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (args: UpdateLabelArgs) => updateLabel(args),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY(scopeType, scopeId) }),
        queryClient.invalidateQueries({ queryKey: ['workItems'] }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
      ])
    },
    onError: () => {
      toast.error(t('features.workItemLabels.updateError', 'Failed to update label.'))
    },
  })
}
