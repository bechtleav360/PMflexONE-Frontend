import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_RISK_ENTRY,
  createRiskEntryMutationResponseSchema,
  RISK_ENTRIES_QUERY_KEY,
} from '../api/riskEntryApi'
import type { CreateRiskEntryInput } from '../types/riskEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for creating a new risk or opportunity entry.
 *
 * Passes `scopeType` and `scopeId` directly in the `CreateRiskEntryInput` —
 * no separate scope-edge mutation required.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateRiskEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateRiskEntryInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_RISK_ENTRY, {
        input: { ...input, scopeType, scopeId },
      })
      return createRiskEntryMutationResponseSchema.parse(raw).createRiskEntry
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RISK_ENTRIES_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
