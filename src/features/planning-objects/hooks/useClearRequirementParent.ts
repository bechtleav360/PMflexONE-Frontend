import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CLEAR_REQUIREMENT_PARENT,
  clearRequirementParentResponseSchema,
  REQUIREMENTS_QUERY_KEY,
} from '../api/requirementApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for removing the parent of a requirement (making it a root node).
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useClearRequirementParent(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      const raw = await graphqlClient.request(CLEAR_REQUIREMENT_PARENT, {
        requirementId: id,
        version,
      })
      return clearRequirementParentResponseSchema.parse(raw).clearRequirementParent
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
