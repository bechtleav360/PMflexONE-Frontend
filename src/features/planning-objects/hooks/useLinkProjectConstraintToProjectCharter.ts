import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CONSTRAINTS_QUERY_KEY,
  LINK_PROJECT_CONSTRAINT_TO_PROJECT_CHARTER,
} from '../api/constraintApi'

/**
 * Mutation hook for linking a project constraint to a project charter.
 *
 * Invalidates the scoped constraints list on success.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useLinkProjectConstraintToProjectCharter(scopeType: string, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      constraintId,
      projectCharterId,
    }: {
      constraintId: string
      projectCharterId: string
    }) => {
      await graphqlClient.request(LINK_PROJECT_CONSTRAINT_TO_PROJECT_CHARTER, {
        constraintId,
        projectCharterId,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONSTRAINTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
