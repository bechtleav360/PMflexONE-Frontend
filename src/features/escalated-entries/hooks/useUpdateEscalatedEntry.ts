import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ESCALATED_ENTRY_QUERY_KEY,
  UPDATE_ESCALATED_ENTRY,
  updateEscalatedEntryResponseSchema,
} from '../api/escalatedEntryApi'
import type { UpdateEscalatedEntryAssessmentInput } from '../types/escalatedEntry.types'

/**
 * Updates the target-level assessment (targetProbability, targetImpact) of an escalated entry.
 *
 * @returns TanStack Query mutation for the updateEscalatedEntry operation.
 */
export function useUpdateEscalatedEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (input: UpdateEscalatedEntryAssessmentInput) => {
      const raw = await graphqlClient.request(UPDATE_ESCALATED_ENTRY, { input })
      return updateEscalatedEntryResponseSchema.parse(raw).updateEscalatedEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ESCALATED_ENTRY_QUERY_KEY(data.id) })
      toast.success(t('features.escalatedEntries.toasts.updateAssessmentSuccess'))
    },
    onError: () => {
      toast.error(t('features.escalatedEntries.toasts.updateAssessmentError'))
    },
  })
}
