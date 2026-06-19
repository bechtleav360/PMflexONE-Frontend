import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ISSUE_ENTRIES_QUERY_KEY } from '../api/issueEntryApi'
import {
  CREATE_ISSUE_FROM_RISK,
  createIssueFromRiskResponseSchema,
  RISK_ENTRIES_QUERY_KEY,
  RISK_ENTRY_QUERY_KEY,
} from '../api/riskEntryApi'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for the "Create issue from risk" escalation action.
 *
 * Calls the backend `createIssueFromRisk` mutation which atomically creates an
 * `IssueEntry` from a `RiskEntry`. The `version` parameter is required for
 * optimistic concurrency — always pass the current risk entry's version.
 *
 * On settlement, invalidates `RISK_ENTRIES_QUERY_KEY` (risk status may change),
 * the specific risk entry detail key, and `ISSUE_ENTRIES_QUERY_KEY` (new issue created).
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateIssueFromRisk(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ riskEntryId, version }: { riskEntryId: string; version: number }) => {
      const raw = await graphqlClient.request(CREATE_ISSUE_FROM_RISK, { riskEntryId, version })
      return createIssueFromRiskResponseSchema.parse(raw).createIssueFromRisk
    },
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({
        queryKey: RISK_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
      void queryClient.invalidateQueries({ queryKey: RISK_ENTRY_QUERY_KEY(variables.riskEntryId) })
      void queryClient.invalidateQueries({
        queryKey: ISSUE_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
    },
  })
}
