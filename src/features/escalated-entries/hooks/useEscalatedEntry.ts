import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ESCALATED_ENTRY_QUERY_KEY,
  GET_ESCALATED_ENTRY,
  getEscalatedEntryResponseSchema,
} from '../api/escalatedEntryApi'

/**
 * Fetches a single escalated entry by id, including its escalation protocol and measures.
 *
 * @param id - The escalated entry ID.
 * @returns TanStack Query result containing the full escalated entry or null.
 */
export function useEscalatedEntry(id: string) {
  return useQuery({
    queryKey: ESCALATED_ENTRY_QUERY_KEY(id),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ESCALATED_ENTRY, { id })
      return getEscalatedEntryResponseSchema.parse(raw).escalatedEntry
    },
    staleTime: 0,
  })
}
