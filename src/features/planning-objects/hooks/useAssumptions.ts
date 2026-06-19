import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ASSUMPTIONS_QUERY_KEY,
  assumptionsResponseSchema,
  GET_ASSUMPTIONS,
} from '../api/assumptionApi'

/**
 * Fetches the scoped list of assumptions.
 *
 * @param scopeType - Scope context (currently always `'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns TanStack Query result containing an array of {@link AssumptionListItem} objects.
 */
export function useAssumptions(scopeType: string, scopeId: string) {
  return useQuery({
    queryKey: ASSUMPTIONS_QUERY_KEY(scopeType, scopeId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ASSUMPTIONS, {
        filter: { scopeType, scopeId },
      })
      return assumptionsResponseSchema.parse(raw).assumptions
    },
    staleTime: 0,
  })
}
