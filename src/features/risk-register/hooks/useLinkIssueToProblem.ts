import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ISSUE_ENTRY_QUERY_KEY } from '../api/issueEntryApi'
import { LINK_ISSUE_TO_PROBLEM, PROBLEM_ENTRY_QUERY_KEY } from '../api/problemEntryApi'

/**
 * Mutation hook for manually linking an issue entry to a problem entry.
 *
 * On success invalidates the issue entry detail cache and the problem entry detail cache
 * so both sides reflect the new link immediately.
 *
 * @returns A TanStack Query mutation object.
 */
export function useLinkIssueToProblem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      issueEntryId,
      problemEntryId,
    }: {
      issueEntryId: string
      problemEntryId: string
    }) => {
      await graphqlClient.request(LINK_ISSUE_TO_PROBLEM, { issueEntryId, problemEntryId })
    },
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ISSUE_ENTRY_QUERY_KEY(variables.issueEntryId),
      })
      void queryClient.invalidateQueries({
        queryKey: PROBLEM_ENTRY_QUERY_KEY(variables.problemEntryId),
      })
    },
  })
}
