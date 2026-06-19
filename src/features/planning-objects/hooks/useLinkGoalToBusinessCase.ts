import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, LINK_GOAL_TO_BUSINESS_CASE } from '../api/goalApi'

/**
 * Mutation hook for linking a goal to a business case.
 *
 * Invalidates the goal detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkGoalToBusinessCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalId, businessCaseId }: { goalId: string; businessCaseId: string }) => {
      await graphqlClient.request(LINK_GOAL_TO_BUSINESS_CASE, { goalId, businessCaseId })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
