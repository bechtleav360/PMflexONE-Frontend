import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ASSUMPTION_QUERY_KEY, UNLINK_ASSUMPTION_FROM_RISK_ENTRY } from '../api/assumptionApi'

/**
 * Mutation hook for removing a manual link between an assumption and a risk entry.
 *
 * Targets edge type "related_risk" — does not affect the "linked" edge from isRisk.
 * Invalidates the assumption detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkAssumptionFromRiskEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      assumptionId,
      riskEntryId,
    }: {
      assumptionId: string
      riskEntryId: string
    }) => {
      await graphqlClient.request(UNLINK_ASSUMPTION_FROM_RISK_ENTRY, { assumptionId, riskEntryId })
    },
    onSuccess: (_data, { assumptionId }) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTION_QUERY_KEY(assumptionId) })
    },
  })
}
