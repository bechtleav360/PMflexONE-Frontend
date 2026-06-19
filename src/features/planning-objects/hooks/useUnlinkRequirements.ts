import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { REQUIREMENT_QUERY_KEY, UNLINK_REQUIREMENTS } from '../api/requirementApi'

/**
 * Mutation hook for removing a directed dependency link between two requirements.
 *
 * Invalidates the detail cache for both the source and target requirements.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkRequirements() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      fromId,
      toId,
      linkType,
    }: {
      fromId: string
      toId: string
      linkType: string
    }) => {
      await graphqlClient.request(UNLINK_REQUIREMENTS, {
        fromId,
        toId,
        linkType: linkType.toLowerCase(),
      })
    },
    onSuccess: (_data, variables) => {
      void queryClient.refetchQueries({
        queryKey: REQUIREMENT_QUERY_KEY(variables.fromId),
        type: 'all',
      })
      void queryClient.refetchQueries({
        queryKey: REQUIREMENT_QUERY_KEY(variables.toId),
        type: 'all',
      })
    },
  })
}
