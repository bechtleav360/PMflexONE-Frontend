import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ESCALATED_ENTRY_QUERY_KEY,
  UPDATE_ESCALATION_MEASURE,
  updateEscalationMeasureResponseSchema,
} from '../api/escalatedEntryApi'
import type { UpdateEscalationMeasureInput } from '../types/escalatedEntry.types'

/**
 * Updates an existing escalation measure; invalidates the parent escalated entry query.
 *
 * @param parentEscalatedEntryId - The escalated entry that owns the measure being updated.
 * @returns TanStack Query mutation for the updateEscalationMeasure operation.
 */
export function useUpdateEscalationMeasure(parentEscalatedEntryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateEscalationMeasureInput) => {
      const raw = await graphqlClient.request(UPDATE_ESCALATION_MEASURE, { input })
      return updateEscalationMeasureResponseSchema.parse(raw).updateEscalationMeasure
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ESCALATED_ENTRY_QUERY_KEY(parentEscalatedEntryId),
      })
    },
  })
}
