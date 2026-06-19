import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  REORDER_REQUIREMENTS,
  reorderRequirementsResponseSchema,
  REQUIREMENTS_QUERY_KEY,
} from '../api/requirementApi'
import type { RequirementListItem } from '../types/requirement.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for persisting requirement display order within a scope.
 *
 * Applies an optimistic update immediately so the tree re-orders without waiting
 * for the server round-trip. Rolls back on error and re-syncs on settle.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useReorderRequirements(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const queryKey = REQUIREMENTS_QUERY_KEY(scopeType, scopeId)

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const raw = await graphqlClient.request(REORDER_REQUIREMENTS, {
        input: { scopeType, scopeId, orderedIds },
      })
      return reorderRequirementsResponseSchema.parse(raw).reorderRequirements
    },
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<RequirementListItem[]>(queryKey)
      queryClient.setQueryData<RequirementListItem[]>(queryKey, (prev) => {
        if (!prev) return prev
        const indexMap = new Map(orderedIds.map((id, i) => [id, i]))
        return [...prev].sort(
          (a, b) => (indexMap.get(a.id) ?? Infinity) - (indexMap.get(b.id) ?? Infinity),
        )
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
