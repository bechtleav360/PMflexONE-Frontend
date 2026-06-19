import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { DELETE_GOAL, GOALS_QUERY_KEY } from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for deleting a goal, with optional cascade to child goals.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useDeleteGoal(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      cascade,
    }: {
      id: string
      version: number
      cascade: boolean
    }) => {
      await graphqlClient.request(DELETE_GOAL, { id, version, cascade })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
