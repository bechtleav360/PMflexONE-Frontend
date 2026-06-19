import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_RISK_ENTRY,
  getRiskEntryResponseSchema,
  RISK_ENTRY_QUERY_KEY,
} from '../api/riskEntryApi'

/**
 * TanStack Query hook for fetching a single risk entry by ID.
 *
 * @param id - The risk entry ID. Pass `null` or `undefined` to skip the fetch.
 * @returns A query result object containing the `RiskEntry` or `null`.
 */
export function useRiskEntry(id: string | null | undefined) {
  return useQuery({
    queryKey: RISK_ENTRY_QUERY_KEY(id ?? ''),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_RISK_ENTRY, { id })
      return getRiskEntryResponseSchema.parse(raw).riskEntry
    },
    enabled: !!id,
    staleTime: 0,
  })
}
