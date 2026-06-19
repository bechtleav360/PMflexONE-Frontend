import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GOAL_QUERY_KEY,
  GOALS_QUERY_KEY,
  SET_PARENT_LEVEL_GOAL,
  setParentLevelGoalResponseSchema,
} from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for setting the cross-scope parent-level goal reference.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useSetParentLevelGoal(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      parentLevelGoalId,
    }: {
      id: string
      version: number
      parentLevelGoalId: string
    }) => {
      const raw = await graphqlClient.request(SET_PARENT_LEVEL_GOAL, {
        goalId: id,
        parentLevelGoalId,
        version,
      })
      return setParentLevelGoalResponseSchema.parse(raw).setParentLevelGoal
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(id) })
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
