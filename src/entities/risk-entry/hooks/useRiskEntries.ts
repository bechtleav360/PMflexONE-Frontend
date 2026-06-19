import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { RISK_ENTRIES_QUERY_KEY } from '../api/queryKeys'

const GET_RISK_ENTRIES_LIST = gql`
  query GetRiskEntriesList($filter: RiskEntryFilter) {
    riskEntries(filter: $filter) {
      id
      entryNumber
      name
    }
  }
`

const riskEntryListItemSchema = z.object({
  id: z.string(),
  entryNumber: z.string(),
  name: z.string(),
})

const getRiskEntriesListResponseSchema = z.object({
  riskEntries: z.array(riskEntryListItemSchema),
})

/**
 * Fetches a scoped list of risk entry list items (id, entryNumber, name) for use
 * in link pickers and comboboxes. Uses a dedicated cache slot that is invalidated
 * together with the full risk entries list.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns TanStack Query result containing an array of `{ id, entryNumber, name }` objects.
 */
export function useRiskEntries(scopeType: string, scopeId: string) {
  return useQuery({
    queryKey: [...RISK_ENTRIES_QUERY_KEY(scopeType, scopeId), 'list'],
    queryFn: async () => {
      const filter = { scopeType, scopeId, includeTerminalStatuses: false }
      const raw = await graphqlClient.request(GET_RISK_ENTRIES_LIST, { filter })
      return getRiskEntriesListResponseSchema.parse(raw).riskEntries
    },
    staleTime: 0,
  })
}
