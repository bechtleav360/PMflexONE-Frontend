import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, UNLINK_GOAL_FROM_BUSINESS_CASE } from '../api/goalApi'

/**
 * Mutation hook for removing the link between a goal and a business case.
 *
 * Invalidates the goal detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkGoalFromBusinessCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalId, businessCaseId }: { goalId: string; businessCaseId: string }) => {
      await graphqlClient.request(UNLINK_GOAL_FROM_BUSINESS_CASE, { goalId, businessCaseId })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
