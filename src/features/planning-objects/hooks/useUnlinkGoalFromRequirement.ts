import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, UNLINK_GOAL_FROM_REQUIREMENT } from '../api/goalApi'

/**
 * TanStack Query key for a single requirement detail.
 * Placeholder — will be replaced once the requirements feature exports its own key factory.
 *
 * @param id - The requirement ID.
 * @returns Readonly tuple used as the TanStack Query cache key.
 */
const REQUIREMENT_QUERY_KEY = (id: string) => ['requirement', id] as const

/**
 * Mutation hook for removing the link between a goal and a requirement.
 *
 * Invalidates the goal detail cache and the requirement detail cache on success.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkGoalFromRequirement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalId, requirementId }: { goalId: string; requirementId: string }) => {
      await graphqlClient.request(UNLINK_GOAL_FROM_REQUIREMENT, { goalId, requirementId })
    },
    onSuccess: (_data, { goalId, requirementId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
      void queryClient.invalidateQueries({ queryKey: REQUIREMENT_QUERY_KEY(requirementId) })
      void queryClient.invalidateQueries({ queryKey: ['requirements'] })
    },
  })
}
