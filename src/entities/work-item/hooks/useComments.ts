import { useQuery } from '@tanstack/react-query'

import { COMMENTS_QUERY_KEY, getComments } from '../api/commentApi'
import type { Comment } from '../types/workItem.types'

/**
 * Fetches all comments for a work item.
 *
 * @param workItemId - The work item ID.
 * @returns A TanStack Query result containing the comments array.
 */
export function useComments(workItemId: string) {
  return useQuery<Comment[]>({
    queryKey: COMMENTS_QUERY_KEY(workItemId),
    queryFn: () => getComments(workItemId),
    staleTime: 0,
    enabled: Boolean(workItemId),
  })
}
