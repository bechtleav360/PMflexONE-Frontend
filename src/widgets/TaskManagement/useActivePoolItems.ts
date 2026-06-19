import { useMemo, useState } from 'react'

import { useWorkItems } from '@/entities/work-item'
import type { ProjectWorkItem } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import type { PriorityFilterSet } from './PriorityFilterBar'

/**
 * Derives the sorted, filtered list of pool work items for the given scope.
 * @param scopeType - The scope entity type.
 * @param scopeId - The scope entity ID.
 * @param assignedWorkItemIds - IDs already assigned to a board column (excluded from pool).
 * @param priorityFilters - Active priority filter set; empty means show all.
 * @returns Loading state, all pool items, the visible (sorted+filtered) items, and setOrderedIds.
 */
export function useActivePoolItems(
  scopeType: ScopeType,
  scopeId: string,
  assignedWorkItemIds: ReadonlySet<string> | undefined,
  priorityFilters: PriorityFilterSet,
) {
  const { data: allItems = [], isLoading } = useWorkItems(scopeType, scopeId, { archived: false })
  const [orderedIds, setOrderedIds] = useState<string[]>([])

  const poolItems = useMemo(
    () => allItems.filter((wi) => wi.boardColumn == null && !assignedWorkItemIds?.has(wi.id)),
    [allItems, assignedWorkItemIds],
  )

  const visibleItems = useMemo(() => {
    const filteredItems =
      priorityFilters.size > 0
        ? poolItems.filter(
            (wi) =>
              (wi.priority != null && priorityFilters.has(wi.priority)) ||
              (wi.priority == null && priorityFilters.has('none')),
          )
        : poolItems

    const base = [...filteredItems].sort((a, b) => {
      const sa = a.position ?? Number.MAX_SAFE_INTEGER
      const sb = b.position ?? Number.MAX_SAFE_INTEGER
      return sa !== sb ? sa - sb : a.createdAt.localeCompare(b.createdAt)
    })
    if (orderedIds.length === 0) return base
    // Optimistic override: respect the user's just-dragged order until the server refetches
    const itemMap = new Map(base.map((wi) => [wi.id, wi]))
    const result: ProjectWorkItem[] = []
    for (const id of orderedIds) {
      const wi = itemMap.get(id)
      if (wi) result.push(wi)
    }
    for (const wi of base) {
      if (!itemMap.has(wi.id)) result.push(wi)
    }
    return result
  }, [poolItems, priorityFilters, orderedIds])

  return { isLoading, poolItems, visibleItems, setOrderedIds }
}
