import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GOAL_QUERY_KEY,
  GOALS_QUERY_KEY,
  UPDATE_GOAL,
  updateGoalResponseSchema,
} from '../api/goalApi'
import type { UpdateGoalInput } from '../types/goal.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for updating an existing goal.
 *
 * Invalidates both the scoped goals list and the individual goal detail on success.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateGoal(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateGoalInput }) => {
      // Backend UpdateGoalInput: id inside input, uses acceptedBy (not acceptedById), no acceptedAt
      const raw = await graphqlClient.request(UPDATE_GOAL, {
        input: {
          id,
          version: input.version,
          name: input.name,
          description: input.description,
          progress: input.progress,
          dueDate: input.dueDate,
          keyResults: input.keyResults,
          impact: input.impact,
          outcome: input.outcome,
          otherInformation: input.otherInformation,
          ...(input.acceptedById !== undefined ? { acceptedBy: input.acceptedById } : {}),
        },
      })
      return updateGoalResponseSchema.parse(raw).updateGoal
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
      void queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEY(id) })
    },
  })
}
