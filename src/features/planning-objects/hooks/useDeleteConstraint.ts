import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { CONSTRAINTS_QUERY_KEY, DELETE_PROJECT_CONSTRAINT } from '../api/constraintApi'

/**
 * Mutation hook for deleting a project constraint.
 *
 * Invalidates the scoped constraints list on success.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the project.
 * @returns A TanStack Query mutation object.
 */
export function useDeleteConstraint(scopeType: 'Project', scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      await graphqlClient.request(DELETE_PROJECT_CONSTRAINT, { id, version })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONSTRAINTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
