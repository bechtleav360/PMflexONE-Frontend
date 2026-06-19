import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  ISSUE_ENTRIES_QUERY_KEY,
  ISSUE_ENTRY_QUERY_KEY,
  UPDATE_ISSUE_ENTRY,
  updateIssueEntryMutationResponseSchema,
} from '../api/issueEntryApi'
import type { UpdateIssueEntryInput } from '../types/issueEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for updating an existing issue entry.
 *
 * The `version` field in the input is required for optimistic concurrency.
 * Always pass the current entry's `version` from fetched data.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateIssueEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateIssueEntryInput }) => {
      const raw = await graphqlClient.request(UPDATE_ISSUE_ENTRY, { id, input })
      return updateIssueEntryMutationResponseSchema.parse(raw).updateIssueEntry
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ISSUE_ENTRIES_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: ISSUE_ENTRY_QUERY_KEY(variables.id) })
    },
  })
}
