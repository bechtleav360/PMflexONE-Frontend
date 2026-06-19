import { useQuery } from '@tanstack/react-query'

import type { ScopeType } from '@/shared/types/scopeType'

import { BOARDS_QUERY_KEY, getBoards } from '../api/boardApi'
import type { Board } from '../types/workItem.types'

/**
 * Fetches all boards for a scope.
 *
 * @param scopeType - The scope type: 'Project' | 'Program' | 'Portfolio'.
 * @param scopeId - The entity ID.
 * @returns A TanStack Query result containing the boards array.
 */
export function useBoards(scopeType: ScopeType, scopeId: string) {
  return useQuery<Board[]>({
    queryKey: BOARDS_QUERY_KEY(scopeType, scopeId),
    queryFn: () => getBoards({ scopeId }),
    staleTime: 0,
  })
}
