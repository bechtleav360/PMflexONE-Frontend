import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELETE_ESCALATION_MEASURE,
  deleteEscalationMeasureResponseSchema,
  ESCALATED_ENTRY_QUERY_KEY,
} from '../api/escalatedEntryApi'

/**
 * Deletes an escalation measure by id; invalidates the parent escalated entry query.
 *
 * @param parentEscalatedEntryId - The escalated entry that owns the measure being deleted.
 * @returns TanStack Query mutation for the deleteEscalationMeasure operation.
 */
export function useDeleteEscalationMeasure(parentEscalatedEntryId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (id: string) => {
      const raw = await graphqlClient.request(DELETE_ESCALATION_MEASURE, { id })
      return deleteEscalationMeasureResponseSchema.parse(raw).deleteEscalationMeasure
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ESCALATED_ENTRY_QUERY_KEY(parentEscalatedEntryId),
      })
      toast.success(t('features.escalatedEntries.toasts.deleteMeasureSuccess'))
    },
    onError: () => {
      toast.error(t('features.escalatedEntries.toasts.deleteMeasureError'))
    },
  })
}
