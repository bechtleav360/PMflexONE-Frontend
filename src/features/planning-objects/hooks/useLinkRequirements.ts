import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { LINK_REQUIREMENTS, REQUIREMENT_QUERY_KEY } from '../api/requirementApi'

/**
 * Mutation hook for creating a directed dependency link between two requirements.
 *
 * Invalidates the detail cache for both the source and target requirements.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkRequirements() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      fromId,
      toId,
      linkType,
    }: {
      fromId: string
      toId: string
      linkType: 'blocks' | 'duplicates' | 'relates_to'
    }) => {
      await graphqlClient.request(LINK_REQUIREMENTS, {
        input: { fromId, toId, linkType: linkType.toLowerCase() },
      })
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENT_QUERY_KEY(variables.fromId) })
      void queryClient.invalidateQueries({ queryKey: REQUIREMENT_QUERY_KEY(variables.toId) })
    },
  })
}
