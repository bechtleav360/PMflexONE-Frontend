import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ASSUMPTION_QUERY_KEY,
  assumptionDetailResponseSchema,
  GET_ASSUMPTION,
} from '../api/assumptionApi'

/**
 * Fetches full detail for a single assumption.
 *
 * @param id - The assumption ID. Pass an empty string to skip the query.
 * @returns TanStack Query result containing the {@link AssumptionListItem} or `null`.
 */
export function useAssumption(id: string) {
  return useQuery({
    queryKey: ASSUMPTION_QUERY_KEY(id),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ASSUMPTION, { id })
      return assumptionDetailResponseSchema.parse(raw).assumption
    },
    enabled: !!id,
    staleTime: 0,
  })
}
