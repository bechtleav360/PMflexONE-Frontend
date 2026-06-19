import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOAL_QUERY_KEY, LINK_GOAL_TO_INITIATION_REQUEST } from '../api/goalApi'

/**
 * Mutation hook to link a goal to an initiation request.
 *
 * @returns TanStack Query mutation result.
 */
export function useLinkGoalToInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      initiationRequestId,
    }: {
      goalId: string
      initiationRequestId: string
    }) => {
      await graphqlClient.request(LINK_GOAL_TO_INITIATION_REQUEST, { goalId, initiationRequestId })
    },
    onSuccess: (_data, { goalId }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(goalId) })
    },
  })
}
