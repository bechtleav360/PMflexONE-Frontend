import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ASSUMPTION_VALIDATION_STATUSES_QUERY_KEY,
  assumptionValidationStatusesResponseSchema,
  LOOKUP_ASSUMPTION_VALIDATION_STATUS,
} from '../api/assumptionApi'

/**
 * Fetches the static lookup table of assumption validation statuses.
 *
 * `staleTime: Infinity` — data never changes at runtime; cached for the session lifetime.
 *
 * @returns TanStack Query result containing an array of {@link AssumptionValidationStatus} objects
 *   sorted by `displayOrder`.
 */
export function useAssumptionValidationStatuses() {
  return useQuery({
    queryKey: ASSUMPTION_VALIDATION_STATUSES_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(LOOKUP_ASSUMPTION_VALIDATION_STATUS)
      const statuses =
        assumptionValidationStatusesResponseSchema.parse(raw).lookupAssumptionValidationStatus
      return [...statuses].sort((a, b) => a.displayOrder - b.displayOrder)
    },
    staleTime: Infinity,
  })
}
