import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  PROBLEM_ENTRIES_QUERY_KEY,
  PROBLEM_ENTRY_QUERY_KEY,
  UPDATE_PROBLEM_ENTRY,
  updateProblemEntryMutationResponseSchema,
} from '../api/problemEntryApi'
import type { UpdateProblemEntryInput } from '../types/problemEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for updating an existing problem entry.
 *
 * The `version` field in the input is required for optimistic concurrency.
 * Always pass the current entry's `version` from fetched data.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateProblemEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProblemEntryInput }) => {
      const raw = await graphqlClient.request(UPDATE_PROBLEM_ENTRY, { id, input })
      return updateProblemEntryMutationResponseSchema.parse(raw).updateProblemEntry
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: PROBLEM_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
      void queryClient.invalidateQueries({ queryKey: PROBLEM_ENTRY_QUERY_KEY(variables.id) })
    },
  })
}
