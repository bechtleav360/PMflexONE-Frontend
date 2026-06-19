import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ASSUMPTION_QUERY_KEY, LINK_ASSUMPTION_TO_RISK_ENTRY } from '../api/assumptionApi'

/**
 * Mutation hook for manually linking an assumption to an existing risk entry.
 *
 * Uses edge type "related_risk" — separate from the "linked" edge created by isRisk.
 * Invalidates the assumption detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkAssumptionToRiskEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      assumptionId,
      riskEntryId,
    }: {
      assumptionId: string
      riskEntryId: string
    }) => {
      await graphqlClient.request(LINK_ASSUMPTION_TO_RISK_ENTRY, { assumptionId, riskEntryId })
    },
    onSuccess: (_data, { assumptionId }) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTION_QUERY_KEY(assumptionId) })
    },
  })
}
