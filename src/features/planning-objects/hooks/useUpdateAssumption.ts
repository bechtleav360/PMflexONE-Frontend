import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { RISK_ENTRIES_QUERY_KEY, useRiskEntryEditTarget } from '@/entities/risk-entry'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ASSUMPTION_QUERY_KEY,
  ASSUMPTIONS_QUERY_KEY,
  UPDATE_ASSUMPTION,
  updateAssumptionResponseSchema,
} from '../api/assumptionApi'
import type { UpdateAssumptionInput } from '../types/assumption.types'

/**
 * Mutation hook for updating an existing assumption.
 *
 * Handles the FR-012 side-effect after a successful mutation:
 * - **FR-012** (isRisk activation): when `isRisk: true` is sent and the server returns a
 *   `linkedRisk.id` (new risk created), sets the risk edit target and navigates to risk management.
 *
 * Always invalidates the scoped assumptions list. On FR-012 also invalidates the risk entries list
 * because a new risk entry was created server-side.
 *
 * @param scopeType - Scope context (currently always `'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateAssumption(scopeType: string, scopeId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const setEditTarget = useRiskEntryEditTarget((s) => s.setEditTarget)

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      wasRisk: boolean
      input: UpdateAssumptionInput
    }) => {
      // Backend UpdateAssumptionInput: id inside input, no validatedById field
      const raw = await graphqlClient.request(UPDATE_ASSUMPTION, {
        input: {
          id,
          version: input.version,
          name: input.name,
          description: input.description,
          dueDate: input.dueDate,
          validationStatus: input.validationStatus,
          isRisk: input.isRisk,
          otherInformation: input.otherInformation,
        },
      })
      return updateAssumptionResponseSchema.parse(raw).updateAssumption
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTIONS_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: ASSUMPTION_QUERY_KEY(variables.id) })

      if (!variables.wasRisk && variables.input.isRisk && data.linkedRisk?.id) {
        // FR-012: assumption escalated to risk for the first time — new risk created by server
        void queryClient.invalidateQueries({ queryKey: RISK_ENTRIES_QUERY_KEY(scopeType, scopeId) })
        setEditTarget(data.linkedRisk.id)
        void navigate(`/projects/${scopeId}/risk-management`)
      }
    },
  })
}
