import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, UNLINK_GOAL_FROM_INITIATION_REQUEST } from '../api/goalApi'

/**
 * Mutation hook to remove the link between a goal and an initiation request.
 *
 * @returns TanStack Query mutation result.
 */
export function useUnlinkGoalFromInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      initiationRequestId,
    }: {
      goalId: string
      initiationRequestId: string
    }) => {
      await graphqlClient.request(UNLINK_GOAL_FROM_INITIATION_REQUEST, {
        goalId,
        initiationRequestId,
      })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
