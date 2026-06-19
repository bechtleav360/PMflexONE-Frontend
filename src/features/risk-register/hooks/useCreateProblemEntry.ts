import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_PROBLEM_ENTRY,
  createProblemEntryMutationResponseSchema,
  PROBLEM_ENTRIES_QUERY_KEY,
} from '../api/problemEntryApi'
import type { CreateProblemEntryInput } from '../types/problemEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for creating a new problem entry.
 *
 * The `scopeType` and `scopeId` are injected from the hook parameters; callers
 * pass only the remaining fields.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateProblemEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateProblemEntryInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_PROBLEM_ENTRY, {
        input: { ...input, scopeType, scopeId },
      })
      return createProblemEntryMutationResponseSchema.parse(raw).createProblemEntry
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: PROBLEM_ENTRIES_QUERY_KEY(scopeType, scopeId),
      })
    },
  })
}
