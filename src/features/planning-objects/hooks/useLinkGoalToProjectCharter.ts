import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, LINK_GOAL_TO_PROJECT_CHARTER } from '../api/goalApi'

/**
 * Mutation hook for linking a goal to a project charter.
 *
 * Invalidates the goal detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkGoalToProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      projectCharterId,
    }: {
      goalId: string
      projectCharterId: string
    }) => {
      await graphqlClient.request(LINK_GOAL_TO_PROJECT_CHARTER, { goalId, projectCharterId })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
