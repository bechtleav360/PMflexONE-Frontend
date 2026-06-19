import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_ISSUE_ENTRY,
  createIssueEntryMutationResponseSchema,
  ISSUE_ENTRIES_QUERY_KEY,
} from '../api/issueEntryApi'
import type { CreateIssueEntryInput } from '../types/issueEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for creating a new issue entry.
 *
 * Passes `scopeType` and `scopeId` directly in the `CreateIssueEntryInput` —
 * no separate scope-edge mutation required.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateIssueEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateIssueEntryInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_ISSUE_ENTRY, {
        input: { ...input, scopeType, scopeId },
      })
      return createIssueEntryMutationResponseSchema.parse(raw).createIssueEntry
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ISSUE_ENTRIES_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
