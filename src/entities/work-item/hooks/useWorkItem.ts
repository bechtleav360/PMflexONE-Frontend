import { useQuery } from '@tanstack/react-query'

import { getWorkItem, WORK_ITEM_QUERY_KEY } from '../api/workItemApi'
import type { ProjectWorkItem } from '../types/workItem.types'

/**
 * Fetches a single work item by ID including comments and links.
 * Attachments are intentionally excluded — use {@link useWorkItemAttachments} for those so that
 * Spring GraphQL enrichment errors on attachments cannot null-propagate and blank this query.
 *
 * @param id - The work item ID.
 * @returns A TanStack Query result containing the work item or null.
 */
export function useWorkItem(id: string) {
  return useQuery<ProjectWorkItem | null>({
    queryKey: WORK_ITEM_QUERY_KEY(id),
    queryFn: () => getWorkItem(id),
    staleTime: 0,
    enabled: Boolean(id),
  })
}
