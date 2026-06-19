import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  LOOKUP_RISK_ENTRY_STATUS,
  lookupRiskEntryStatusResponseSchema,
  RISK_ENTRY_STATUSES_QUERY_KEY,
} from '../api/riskEntryApi'

/**
 * Fetches the static list of risk entry status options from the backend.
 *
 * @returns TanStack Query result containing an array of `{ value, label }` objects.
 */
export function useRiskEntryStatuses() {
  return useQuery({
    queryKey: RISK_ENTRY_STATUSES_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(LOOKUP_RISK_ENTRY_STATUS)
      return lookupRiskEntryStatusResponseSchema.parse(raw).lookupRiskEntryStatus
    },
    staleTime: Infinity,
  })
}
