import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ASSUMPTION_QUERY_KEY, LINK_ASSUMPTION_TO_PROJECT_CHARTER } from '../api/assumptionApi'

/**
 * Mutation hook for linking an assumption to a project charter.
 *
 * Invalidates the assumption detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkAssumptionToProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      assumptionId,
      projectCharterId,
    }: {
      assumptionId: string
      projectCharterId: string
    }) => {
      await graphqlClient.request(LINK_ASSUMPTION_TO_PROJECT_CHARTER, {
        assumptionId,
        projectCharterId,
      })
    },
    onSuccess: (_data, { assumptionId }) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTION_QUERY_KEY(assumptionId) })
    },
  })
}
