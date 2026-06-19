import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_ISSUE_ENTRY,
  getIssueEntryResponseSchema,
  ISSUE_ENTRY_QUERY_KEY,
} from '../api/issueEntryApi'

/**
 * TanStack Query hook for fetching a single issue entry by ID (includes linked entries).
 *
 * @param id - The issue entry ID. Pass `null` or `undefined` to skip the fetch.
 * @returns A query result object containing the `IssueEntry` or `null`.
 */
export function useIssueEntry(id: string | null | undefined) {
  return useQuery({
    queryKey: ISSUE_ENTRY_QUERY_KEY(id ?? ''),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ISSUE_ENTRY, { id })
      return getIssueEntryResponseSchema.parse(raw).issueEntry
    },
    enabled: !!id,
    staleTime: 0,
  })
}
