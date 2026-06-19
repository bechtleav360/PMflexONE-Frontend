import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ASSUMPTIONS_QUERY_KEY, DELETE_ASSUMPTION } from '../api/assumptionApi'

/**
 * Mutation hook for deleting an assumption.
 *
 * Invalidates the scoped assumptions list on success.
 *
 * @param scopeType - Scope context (currently always `'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object. Call `mutate({ id, version })`.
 */
export function useDeleteAssumption(scopeType: string, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      await graphqlClient.request(DELETE_ASSUMPTION, { id, version })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSUMPTIONS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
