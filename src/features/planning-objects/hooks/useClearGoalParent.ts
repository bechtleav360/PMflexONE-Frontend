import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { CLEAR_GOAL_PARENT, clearGoalParentResponseSchema, GOALS_QUERY_KEY } from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for removing the parent goal of a goal (makes it a root goal).
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useClearGoalParent(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      const raw = await graphqlClient.request(CLEAR_GOAL_PARENT, { goalId: id, version })
      return clearGoalParentResponseSchema.parse(raw).clearGoalParent
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
