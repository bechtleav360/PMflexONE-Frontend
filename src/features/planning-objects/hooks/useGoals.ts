import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_GOALS, GOALS_QUERY_KEY, goalsResponseSchema } from '../api/goalApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Fetches the scoped list of goals.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The ID of the scoped entity.
 * @param options - Optional TanStack Query overrides (e.g. `enabled`).
 * @returns TanStack Query result containing an array of {@link GoalListItem} objects.
 */
export function useGoals(
  scopeType: PlanningObjectScopeType,
  scopeId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: GOALS_QUERY_KEY(scopeType, scopeId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_GOALS, { filter: { scopeType, scopeId } })
      return goalsResponseSchema.parse(raw).goals
    },
    staleTime: 0,
    enabled: options?.enabled,
  })
}
