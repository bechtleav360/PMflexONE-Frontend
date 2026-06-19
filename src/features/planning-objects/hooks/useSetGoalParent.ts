import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GOALS_QUERY_KEY, SET_GOAL_PARENT, setGoalParentResponseSchema } from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for setting the parent goal of a goal (tree hierarchy).
 *
 * Detects cycle errors from the backend and surfaces them as a toast.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useSetGoalParent(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      parentId,
    }: {
      id: string
      version: number
      parentId: string
    }) => {
      const raw = await graphqlClient.request(SET_GOAL_PARENT, { goalId: id, parentId, version })
      return setGoalParentResponseSchema.parse(raw).setGoalParent
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      if (/cycle|circular/i.test(message)) {
        toast.error(t('features.planningObjects.errors.cycleDetected'))
      }
    },
  })
}
