import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ISSUE_ENTRY_QUERY_KEY } from '../api/issueEntryApi'
import { UNLINK_RISK_FROM_ISSUE } from '../api/problemEntryApi'
import { RISK_ENTRY_QUERY_KEY } from '../api/riskEntryApi'

/**
 * Mutation hook for manually unlinking a risk entry from an issue entry.
 *
 * On success invalidates the risk entry detail cache and the issue entry detail cache
 * so both sides reflect the removed link immediately.
 *
 * @returns A TanStack Query mutation object.
 */
export function useUnlinkRiskFromIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      riskEntryId,
      issueEntryId,
    }: {
      riskEntryId: string
      issueEntryId: string
    }) => {
      await graphqlClient.request(UNLINK_RISK_FROM_ISSUE, { riskEntryId, issueEntryId })
    },
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({ queryKey: RISK_ENTRY_QUERY_KEY(variables.riskEntryId) })
      void queryClient.invalidateQueries({
        queryKey: ISSUE_ENTRY_QUERY_KEY(variables.issueEntryId),
      })
    },
  })
}
