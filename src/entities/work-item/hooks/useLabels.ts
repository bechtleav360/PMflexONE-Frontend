import { useQuery } from '@tanstack/react-query'

import type { ScopeType } from '@/shared/types/scopeType'

import { getLabels, LABELS_QUERY_KEY } from '../api/labelApi'
import type { Label } from '../types/workItem.types'

/**
 * Fetches all labels for a scope.
 *
 * @param scopeType - The scope type: 'project' | 'program' | 'portfolio'.
 * @param scopeId - The entity ID.
 * @returns A TanStack Query result containing the labels array.
 */
export function useLabels(scopeType: ScopeType, scopeId: string) {
  return useQuery<Label[]>({
    queryKey: LABELS_QUERY_KEY(scopeType, scopeId),
    queryFn: () => getLabels({ scopeId }),
    staleTime: 0,
  })
}
