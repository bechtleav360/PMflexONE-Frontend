import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { CREATE_GOAL, createGoalResponseSchema, GOALS_QUERY_KEY } from '../api/goalApi'
import type { CreateGoalInput } from '../types/goal.types'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for creating a new goal within a given scope.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useCreateGoal(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<CreateGoalInput, 'scopeType' | 'scopeId'>) => {
      const raw = await graphqlClient.request(CREATE_GOAL, {
        input: {
          name: input.name,
          description: input.description,
          progress: input.progress,
          dueDate: input.dueDate,
          keyResults: input.keyResults,
          impact: input.impact,
          outcome: input.outcome,
          otherInformation: input.otherInformation,
          scopeType,
          scopeId,
        },
      })
      return createGoalResponseSchema.parse(raw).createGoal
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
