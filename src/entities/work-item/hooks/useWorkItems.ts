import { useQuery } from '@tanstack/react-query'

import type { ScopeType } from '@/shared/types/scopeType'

import { getWorkItems, WORK_ITEMS_QUERY_KEY } from '../api/workItemApi'
import type { WorkItemFilter } from '../api/workItemApi'
import type { ProjectWorkItem } from '../types/workItem.types'

/**
 * Fetches a filtered list of work items scoped to a single entity.
 *
 * @param scopeType - The scope type: 'Project' | 'Program' | 'Portfolio'.
 * @param scopeId - The entity ID.
 * @param filter - Optional additional filter parameters.
 * @returns A TanStack Query result containing the project work items array.
 */
export function useWorkItems(
  scopeType: ScopeType,
  scopeId: string,
  filter?: Omit<WorkItemFilter, 'scopeId'>,
) {
  return useQuery<ProjectWorkItem[]>({
    queryKey: [
      ...WORK_ITEMS_QUERY_KEY(scopeType, scopeId),
      filter?.archived ?? 'all',
      filter?.status ?? 'all',
    ],
    queryFn: () => getWorkItems({ ...filter, scopeId }),
    staleTime: 0,
  })
}
