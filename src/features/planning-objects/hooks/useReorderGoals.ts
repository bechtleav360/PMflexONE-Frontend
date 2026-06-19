import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOALS_QUERY_KEY, REORDER_GOALS, reorderGoalsResponseSchema } from '../api/goalApi'
import type { GoalListItem } from '../types/goal.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for persisting goal display order within a scope.
 *
 * Applies an optimistic update immediately so the tree re-orders without waiting
 * for the server round-trip. Rolls back on error and re-syncs on settle.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useReorderGoals(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const queryKey = GOALS_QUERY_KEY(scopeType, scopeId)

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const raw = await graphqlClient.request(REORDER_GOALS, {
        input: { scopeType, scopeId, orderedIds },
      })
      return reorderGoalsResponseSchema.parse(raw).reorderGoals
    },
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<GoalListItem[]>(queryKey)
      queryClient.setQueryData<GoalListItem[]>(queryKey, (prev) => {
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
