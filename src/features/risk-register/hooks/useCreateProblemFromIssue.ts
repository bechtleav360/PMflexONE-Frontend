import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ISSUE_ENTRIES_QUERY_KEY, ISSUE_ENTRY_QUERY_KEY } from '../api/issueEntryApi'
import {
  CREATE_PROBLEM_FROM_ISSUE,
  createProblemFromIssueResponseSchema,
  PROBLEM_ENTRIES_QUERY_KEY,
} from '../api/problemEntryApi'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for the "Create problem from issue" escalation action.
 *
 * Calls the backend `createProblemFromIssue` mutation which atomically creates a
 * `ProblemEntry` from an `IssueEntry`. The source issue is moved to Resolved status
 * (irreversible). The `version` parameter is required for optimistic concurrency.
 *
 * On settlement, invalidates `ISSUE_ENTRIES_QUERY_KEY`, the specific issue entry detail key,
 * and `PROBLEM_ENTRIES_QUERY_KEY`.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateProblemFromIssue(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ issueEntryId, version }: { issueEntryId: string; version: number }) => {
      const raw = await graphqlClient.request(CREATE_PROBLEM_FROM_ISSUE, {
        issueEntryId,
        version,
      })
      return createProblemFromIssueResponseSchema.parse(raw).createProblemFromIssue
    },
    onSettled: (_, __, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ISSUE_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
      void queryClient.invalidateQueries({
        queryKey: ISSUE_ENTRY_QUERY_KEY(variables.issueEntryId),
      })
      void queryClient.invalidateQueries({
        queryKey: PROBLEM_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
    },
  })
}
