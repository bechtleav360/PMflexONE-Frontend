import { useQuery } from '@tanstack/react-query'

import type { ScopeType } from '@/shared/types/scopeType'

import { getStakeholderEntries } from '../api/getStakeholderEntriesApi'
import type { StakeholderEntry } from '../types/stakeholder.types'

/**
 * Derives the TanStack Query key for the stakeholder entries query.
 *
 * @param scopeType - The type of scope.
 * @param scopeId - The ID of the scope.
 * @returns A readonly tuple used as the query key.
 */
export const getStakeholderEntriesQueryKey = (scopeType: string, scopeId: string) =>
  ['stakeholderEntries', scopeType, scopeId] as const

/**
 * TanStack Query hook that fetches all stakeholder entries for a given scope.
 *
 * @param scopeType - The type of scope (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope.
 * @returns A query result with an array of {@link StakeholderEntry} objects.
 */
export function useGetStakeholderEntries(scopeType: ScopeType, scopeId: string) {
  return useQuery<StakeholderEntry[]>({
    queryKey: getStakeholderEntriesQueryKey(scopeType, scopeId),
    queryFn: () => getStakeholderEntries(scopeType, scopeId),
    staleTime: 0,
  })
}
