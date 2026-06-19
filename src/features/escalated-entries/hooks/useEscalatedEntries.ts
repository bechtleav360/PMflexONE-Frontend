import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ESCALATED_ENTRIES_QUERY_KEY,
  GET_ESCALATED_ENTRIES,
  getEscalatedEntriesResponseSchema,
} from '../api/escalatedEntryApi'
import type { EscalatedEntryFilter } from '../types/escalatedEntry.types'

/**
 * Fetches the list of escalated entries for a given scope, with optional source type filter.
 *
 * @param filter - Scope and optional type/status filters for the query.
 * @returns TanStack Query result containing the escalated entries array.
 */
export function useEscalatedEntries(filter: EscalatedEntryFilter) {
  const { scopeId, scopeType, sourceEntryType } = filter

  return useQuery({
    queryKey: ESCALATED_ENTRIES_QUERY_KEY(scopeId, scopeType, sourceEntryType),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ESCALATED_ENTRIES, { filter })
      return getEscalatedEntriesResponseSchema.parse(raw).escalatedEntries
    },
    staleTime: 0,
  })
}
