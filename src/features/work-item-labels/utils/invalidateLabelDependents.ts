import type { QueryClient } from '@tanstack/react-query'

import { invalidateWorkItemDependents, LABELS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

/**
 * Invalidates label and work-item-dependent queries after a label mutation.
 * Combines the scoped labels query key with the broad work-item dependents
 * (workItems and board).
 *
 * @param queryClient - The TanStack Query client instance.
 * @param scopeType - The scope type (e.g. 'Project').
 * @param scopeId - The ID of the scope.
 */
export async function invalidateLabelDependents(
  queryClient: QueryClient,
  scopeType: ScopeType,
  scopeId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: LABELS_QUERY_KEY(scopeType, scopeId) }),
    invalidateWorkItemDependents(queryClient),
  ])
}
