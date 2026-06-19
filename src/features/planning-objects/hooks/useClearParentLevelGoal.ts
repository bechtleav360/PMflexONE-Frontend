import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CLEAR_PARENT_LEVEL_GOAL,
  clearParentLevelGoalResponseSchema,
  GOAL_QUERY_KEY,
  GOALS_QUERY_KEY,
} from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for clearing the cross-scope parent-level goal reference.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useClearParentLevelGoal(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      const raw = await graphqlClient.request(CLEAR_PARENT_LEVEL_GOAL, { goalId: id, version })
      return clearParentLevelGoalResponseSchema.parse(raw).clearParentLevelGoal
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(id) })
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
