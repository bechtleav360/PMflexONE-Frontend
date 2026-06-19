import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_INITIATION_REQUESTS_BY_SCOPE_ID,
  INITIATION_REQUESTS_BY_SCOPE_QUERY_KEY,
  initiationRequestsByScopeResponseSchema,
} from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Fetches initiation requests belonging to a given scope (project, program, or portfolio).
 *
 * @param scopeId - The ID of the scope entity.
 * @param scopeType - The type of the scope entity.
 * @returns TanStack Query result with the initiation request list.
 */
export function useInitiationRequestsByScopeId(
  scopeId: string,
  scopeType: PlanningObjectScopeType,
) {
  return useQuery({
    queryKey: INITIATION_REQUESTS_BY_SCOPE_QUERY_KEY(scopeId, scopeType),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_INITIATION_REQUESTS_BY_SCOPE_ID, {
        scopeId,
        scopeType,
      })
      return initiationRequestsByScopeResponseSchema.parse(raw).initiationRequestsByScopeId
    },
    enabled: !!scopeId,
    staleTime: 5 * 60 * 1000,
  })
}
