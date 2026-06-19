import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ASSUMPTION_QUERY_KEY, UNLINK_ASSUMPTION_FROM_PROJECT_CHARTER } from '../api/assumptionApi'

/**
 * Mutation hook for removing the link between an assumption and a project charter.
 *
 * Invalidates the assumption detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkAssumptionFromProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      assumptionId,
      projectCharterId,
    }: {
      assumptionId: string
      projectCharterId: string
    }) => {
      await graphqlClient.request(UNLINK_ASSUMPTION_FROM_PROJECT_CHARTER, {
        assumptionId,
        projectCharterId,
      })
    },
    onSuccess: (_data, { assumptionId }) => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTION_QUERY_KEY(assumptionId) })
    },
  })
}
