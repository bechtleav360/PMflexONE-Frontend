import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_ESCALATION_MEASURE,
  createEscalationMeasureResponseSchema,
  ESCALATED_ENTRY_QUERY_KEY,
} from '../api/escalatedEntryApi'
import type { AddEscalationMeasureInput } from '../types/escalatedEntry.types'

/**
 * Appends a new action measure to an escalated entry.
 *
 * @returns TanStack Query mutation for the createEscalationMeasure operation.
 */
export function useCreateEscalationMeasure() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (input: AddEscalationMeasureInput) => {
      const raw = await graphqlClient.request(CREATE_ESCALATION_MEASURE, { input })
      return createEscalationMeasureResponseSchema.parse(raw).createEscalationMeasure
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ESCALATED_ENTRY_QUERY_KEY(variables.escalatedEntryId),
      })
      toast.success(t('features.escalatedEntries.toasts.addMeasureSuccess'))
    },
    onError: () => {
      toast.error(t('features.escalatedEntries.toasts.addMeasureError'))
    },
  })
}
