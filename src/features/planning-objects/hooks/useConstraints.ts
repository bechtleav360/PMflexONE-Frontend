import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CONSTRAINTS_QUERY_KEY,
  constraintsResponseSchema,
  GET_PROJECT_CONSTRAINTS,
} from '../api/constraintApi'

/**
 * Fetches the flat list of project constraints for a given scope.
 *
 * @param scopeType - Scope context (always `'Project'` for constraints).
 * @param scopeId - The ID of the project.
 * @returns TanStack Query result containing an array of {@link ConstraintListItem} objects.
 */
export function useConstraints(scopeType: 'Project', scopeId: string) {
  return useQuery({
    queryKey: CONSTRAINTS_QUERY_KEY(scopeType, scopeId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PROJECT_CONSTRAINTS, {
        filter: { scopeType, scopeId },
      })
      return constraintsResponseSchema.parse(raw).projectConstraints
    },
    staleTime: 0,
  })
}
