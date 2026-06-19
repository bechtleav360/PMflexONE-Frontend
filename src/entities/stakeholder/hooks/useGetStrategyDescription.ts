import { useQuery } from '@tanstack/react-query'

import type { ScopeType } from '@/shared/types/scopeType'

import { getStrategyDescription } from '../api/getStrategyDescriptionApi'
import type { StrategyDescription } from '../types/stakeholder.types'

/**
 * Derives the TanStack Query key for the strategy description query.
 *
 * @param scopeType - The type of scope.
 * @param scopeId - The ID of the scope.
 * @returns A readonly tuple used as the query key.
 */
export const getStrategyDescriptionQueryKey = (scopeType: string, scopeId: string) =>
  ['stakeholderStrategyDescription', scopeType, scopeId] as const

/**
 * TanStack Query hook that fetches the strategy description for a given scope.
 *
 * @param scopeType - The type of scope (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope.
 * @returns A query result with the {@link StrategyDescription}, or `null` if none exists.
 */
export function useGetStrategyDescription(scopeType: ScopeType, scopeId: string) {
  return useQuery<StrategyDescription | null>({
    queryKey: getStrategyDescriptionQueryKey(scopeType, scopeId),
    queryFn: () => getStrategyDescription(scopeType, scopeId),
    staleTime: 0,
  })
}
