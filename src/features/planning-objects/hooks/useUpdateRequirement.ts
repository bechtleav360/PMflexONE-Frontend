import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  REQUIREMENT_QUERY_KEY,
  REQUIREMENTS_QUERY_KEY,
  UPDATE_REQUIREMENT,
  updateRequirementResponseSchema,
} from '../api/requirementApi'
import type { UpdateRequirementInput } from '../types/requirement.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for updating an existing requirement.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateRequirement(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRequirementInput }) => {
      // Backend UpdateRequirementInput has id inside input
      const raw = await graphqlClient.request(UPDATE_REQUIREMENT, { input: { id, ...input } })
      return updateRequirementResponseSchema.parse(raw).updateRequirement
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: REQUIREMENT_QUERY_KEY(variables.id) })
    },
  })
}
