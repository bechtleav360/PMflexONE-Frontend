import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_GOAL, GOAL_QUERY_KEY, goalDetailResponseSchema } from '../api/goalApi'

/**
 * Fetches a single goal with full detail and linked entities.
 *
 * @param id - The goal ID. Query is disabled when falsy.
 * @returns TanStack Query result containing a {@link GoalDetail} or `null`.
 */
export function useGoal(id: string) {
  return useQuery({
    queryKey: GOAL_QUERY_KEY(id),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_GOAL, { id })
      return goalDetailResponseSchema.parse(raw).goal
    },
    enabled: !!id,
    staleTime: 0,
  })
}
