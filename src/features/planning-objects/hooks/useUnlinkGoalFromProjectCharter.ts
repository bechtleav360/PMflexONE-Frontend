import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, UNLINK_GOAL_FROM_PROJECT_CHARTER } from '../api/goalApi'

/**
 * Mutation hook for removing the link between a goal and a project charter.
 *
 * Invalidates the goal detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkGoalFromProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      projectCharterId,
    }: {
      goalId: string
      projectCharterId: string
    }) => {
      await graphqlClient.request(UNLINK_GOAL_FROM_PROJECT_CHARTER, { goalId, projectCharterId })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
