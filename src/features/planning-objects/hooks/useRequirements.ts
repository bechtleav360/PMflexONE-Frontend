import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_REQUIREMENTS,
  REQUIREMENTS_QUERY_KEY,
  requirementsResponseSchema,
} from '../api/requirementApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Fetches the scoped flat list of requirements.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns TanStack Query result containing an array of {@link RequirementListItem} objects.
 */
export function useRequirements(scopeType: PlanningObjectScopeType, scopeId: string) {
  return useQuery({
    queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_REQUIREMENTS, {
        filter: { scopeType, scopeId },
      })
      return requirementsResponseSchema.parse(raw).requirements
    },
    staleTime: 0,
  })
}
