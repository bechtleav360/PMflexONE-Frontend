import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, LINK_GOALS } from '../api/goalApi'

/**
 * Mutation hook for creating a peer relationship between two goals.
 *
 * Invalidates the detail cache for both participating goals on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkGoals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fromId, toId }: { fromId: string; toId: string }) => {
      await graphqlClient.request(LINK_GOALS, { goalId: fromId, relatedGoalId: toId })
    },
    onSuccess: (_data, { fromId, toId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(fromId) })
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(toId) })
    },
  })
}
