import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ISSUE_ENTRY_STATUSES_QUERY_KEY,
  LOOKUP_ISSUE_ENTRY_STATUS,
  lookupIssueEntryStatusResponseSchema,
} from '../api/issueEntryApi'

/**
 * Fetches the static list of issue entry status options from the backend.
 *
 * @returns TanStack Query result containing an array of `{ value, label }` objects.
 */
export function useIssueEntryStatuses() {
  return useQuery({
    queryKey: ISSUE_ENTRY_STATUSES_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(LOOKUP_ISSUE_ENTRY_STATUS)
      return lookupIssueEntryStatusResponseSchema.parse(raw).lookupIssueEntryStatus
    },
    staleTime: Infinity,
  })
}
