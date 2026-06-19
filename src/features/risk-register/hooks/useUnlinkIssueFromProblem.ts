import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ISSUE_ENTRY_QUERY_KEY } from '../api/issueEntryApi'
import { PROBLEM_ENTRY_QUERY_KEY, UNLINK_ISSUE_FROM_PROBLEM } from '../api/problemEntryApi'

/**
 * Mutation hook for manually unlinking an issue entry from a problem entry.
 *
 * On success invalidates the issue entry detail cache and the problem entry detail cache
 * so both sides reflect the removed link immediately.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkIssueFromProblem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      issueEntryId,
      problemEntryId,
    }: {
      issueEntryId: string
      problemEntryId: string
    }) => {
      await graphqlClient.request(UNLINK_ISSUE_FROM_PROBLEM, { issueEntryId, problemEntryId })
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
