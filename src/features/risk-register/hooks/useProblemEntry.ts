import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_PROBLEM_ENTRY,
  getProblemEntryResponseSchema,
  PROBLEM_ENTRY_QUERY_KEY,
} from '../api/problemEntryApi'

/**
 * TanStack Query hook for fetching a single problem (issue) entry by ID.
 *
 * @param id - The problem entry ID. Pass `null` or `undefined` to skip the fetch.
 * @returns A query result object containing the `ProblemEntry` or `null`.
 */
export function useProblemEntry(id: string | null | undefined) {
  return useQuery({
    queryKey: PROBLEM_ENTRY_QUERY_KEY(id ?? ''),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PROBLEM_ENTRY, { id })
      return getProblemEntryResponseSchema.parse(raw).problemEntry
    },
    enabled: !!id,
    staleTime: 0,
  })
}
