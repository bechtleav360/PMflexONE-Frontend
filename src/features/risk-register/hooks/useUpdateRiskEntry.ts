import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  RISK_ENTRIES_QUERY_KEY,
  RISK_ENTRY_QUERY_KEY,
  UPDATE_RISK_ENTRY,
  updateRiskEntryMutationResponseSchema,
} from '../api/riskEntryApi'
import type { UpdateRiskEntryInput } from '../types/riskEntry.types'
import type { ScopeType } from '../types/scopeType'

/**
 * Mutation hook for updating an existing risk or opportunity entry.
 *
 * The `version` field in the input is required for optimistic concurrency.
 * Always pass the current entry's `version` from fetched data.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateRiskEntry(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRiskEntryInput }) => {
      const raw = await graphqlClient.request(UPDATE_RISK_ENTRY, { id, input })
      return updateRiskEntryMutationResponseSchema.parse(raw).updateRiskEntry
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: RISK_ENTRIES_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: RISK_ENTRY_QUERY_KEY(variables.id) })
    },
  })
}
