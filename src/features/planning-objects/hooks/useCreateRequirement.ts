import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_REQUIREMENT,
  createRequirementResponseSchema,
  REQUIREMENTS_QUERY_KEY,
} from '../api/requirementApi'
import type { CreateRequirementInput } from '../types/requirement.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for creating a new requirement within a given scope.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateRequirement(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateRequirementInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_REQUIREMENT, {
        input: { ...input, scopeType, scopeId },
      })
      return createRequirementResponseSchema.parse(raw).createRequirement
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
