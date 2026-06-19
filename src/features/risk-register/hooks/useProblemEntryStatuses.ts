import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  LOOKUP_PROBLEM_ENTRY_STATUS,
  lookupProblemEntryStatusResponseSchema,
  PROBLEM_ENTRY_STATUSES_QUERY_KEY,
} from '../api/problemEntryApi'

/**
 * Fetches the static list of problem (issue) entry status options from the backend.
 *
 * @returns TanStack Query result containing an array of `{ value, label }` objects.
 */
export function useProblemEntryStatuses() {
  return useQuery({
    queryKey: PROBLEM_ENTRY_STATUSES_QUERY_KEY,
    queryFn: async () => {
      const raw = await graphqlClient.request(LOOKUP_PROBLEM_ENTRY_STATUS)
      return lookupProblemEntryStatusResponseSchema.parse(raw).lookupProblemEntryStatus
    },
    staleTime: Infinity,
  })
}
