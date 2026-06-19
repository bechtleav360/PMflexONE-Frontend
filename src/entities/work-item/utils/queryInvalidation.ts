import type { QueryClient } from '@tanstack/react-query'

import { BOARD_CACHE_PREFIX } from '../api/queryKeys'

/**
 * Invalidates the broad work-item-dependent query keys (['workItems'] and BOARD_CACHE_PREFIX).
 * Use this helper whenever a mutation affects work item list or board views.
 *
 * @param queryClient - The TanStack Query client instance.
 */
export async function invalidateWorkItemDependents(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['workItems'] }),
    queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
  ])
}
