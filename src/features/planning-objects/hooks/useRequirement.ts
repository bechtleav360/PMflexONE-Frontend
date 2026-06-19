import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_REQUIREMENT,
  REQUIREMENT_QUERY_KEY,
  requirementDetailResponseSchema,
} from '../api/requirementApi'

/**
 * Fetches the full detail of a single requirement.
 *
 * @param id - The requirement ID. Query is disabled when empty.
 * @returns TanStack Query result containing a {@link RequirementDetail} or `null`.
 */
export function useRequirement(id: string) {
  return useQuery({
    queryKey: REQUIREMENT_QUERY_KEY(id),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_REQUIREMENT, { id })
      return requirementDetailResponseSchema.parse(raw).requirement
    },
    enabled: !!id,
    staleTime: 0,
  })
}
