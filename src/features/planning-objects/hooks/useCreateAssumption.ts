import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { RISK_ENTRIES_QUERY_KEY, useRiskEntryEditTarget } from '@/entities/risk-entry'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ASSUMPTIONS_QUERY_KEY,
  CREATE_ASSUMPTION,
  createAssumptionResponseSchema,
} from '../api/assumptionApi'
import type { CreateAssumptionInput } from '../types/assumption.types'

/**
 * Mutation hook for creating a new assumption within a given scope.
 *
 * Invalidates the scoped assumptions list on success.
 *
 * @param scopeType - Scope context (currently always `'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateAssumption(scopeType: string, scopeId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const setEditTarget = useRiskEntryEditTarget((s) => s.setEditTarget)

  return useMutation({
    mutationFn: async (input: Omit<CreateAssumptionInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_ASSUMPTION, {
        input: {
          name: input.name,
          description: input.description,
          dueDate: input.dueDate,
          validationStatus: input.validationStatus,
          isRisk: input.isRisk,
          otherInformation: input.otherInformation,
          scopeType,
          scopeId,
        },
      })
      return createAssumptionResponseSchema.parse(raw).createAssumption
    },
    onSuccess: (data, input) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTIONS_QUERY_KEY(scopeType, scopeId) })

      if (input.isRisk && data.linkedRisk?.id) {
        // FR-012: new assumption created as risk — navigate to risk management and open edit dialog
        void queryClient.invalidateQueries({ queryKey: RISK_ENTRIES_QUERY_KEY(scopeType, scopeId) })
        setEditTarget(data.linkedRisk.id)
        void navigate(`/projects/${scopeId}/risk-management`)
      }
    },
  })
}
