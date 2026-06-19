import type { useTranslation } from 'react-i18next'

import type { BoardColumn, ProjectWorkItem } from '@/entities/work-item'

/** Maximum number of columns allowed per board. */
export const MAX_COLUMNS = 8

/** Maps priority key to its sort weight (higher = more urgent). */
export const PRIORITY_ORDER: Record<string, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  VERY_HIGH: 3,
}

/** Canonical priority group keys in display order. */
export const PRIORITY_GROUP_KEYS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'none'] as const

/**
 * Sorts backlog work items by priority descending, then by creation date descending.
 * @param items - The work items to sort.
 * @returns A new array sorted by priority then creation date.
 */
export function sortBacklog(items: ProjectWorkItem[]): ProjectWorkItem[] {
  return [...items].sort((a, b) => {
    const pa = a.priority != null ? (PRIORITY_ORDER[a.priority] ?? 4) : 4
    const pb = b.priority != null ? (PRIORITY_ORDER[b.priority] ?? 4) : 4
    if (pa !== pb) return pa - pb
    return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
  })
}

/**
 * Groups a sorted backlog by priority key, filtering out empty groups.
 * @param sorted - Pre-sorted work items to group.
 * @returns An array of `{ key, items }` objects for each non-empty priority group.
 */
export function groupBacklog(
  sorted: ProjectWorkItem[],
): { key: string; items: ProjectWorkItem[] }[] {
  const map = new Map<string, ProjectWorkItem[]>()
  for (const wi of sorted) {
    const key = wi.priority ?? 'none'
    const group = map.get(key) ?? []
    if (group.length === 0) map.set(key, group)
    group.push(wi)
  }
  return PRIORITY_GROUP_KEYS.map((key) => ({ key, items: map.get(key) ?? [] })).filter(
    (g) => g.items.length > 0,
  )
}

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  in_progress: 1,
  done: 2,
}

/**
 * Sorts board columns by workflow status order, then by position within each status group.
 * @param columns - The board columns to sort.
 * @returns A new array sorted by status then position.
 */
export function sortColumns(columns: BoardColumn[]): BoardColumn[] {
  return [...columns].sort((a, b) => {
    const aOrder = STATUS_ORDER[a.workItemStatus] ?? 0
    const bOrder = STATUS_ORDER[b.workItemStatus] ?? 0
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.position - b.position
  })
}

function matchesPriorityFilter(wi: ProjectWorkItem, priorities: ReadonlySet<string>): boolean {
  const p = wi.priority ?? 'none'
  return priorities.has(p)
}

/**
 * Filters work items by active priority, label, and assignee filters.
 * @param items - The work items to filter.
 * @param filter - The active filter criteria.
 * @param filter.priorities - Optional set of priority keys to include.
 * @param filter.labelId - Optional label ID to match.
 * @param filter.assigneeId - Optional assignee ID to match.
 * @returns The subset of items matching all active filters.
 */
export function applyFilter(
  items: ProjectWorkItem[],
  filter: { priorities?: ReadonlySet<string>; labelId?: string | null; assigneeId?: string | null },
): ProjectWorkItem[] {
  return items.filter((wi) => {
    if (
      filter.priorities &&
      filter.priorities.size > 0 &&
      !matchesPriorityFilter(wi, filter.priorities)
    )
      return false
    if (filter.labelId && !wi.labels?.some((l) => l.id === filter.labelId)) return false
    if (filter.assigneeId && wi.assignee?.id !== filter.assigneeId) return false
    return true
  })
}

/**
 * Creates ARIA live-region announcements for board drag-and-drop operations.
 * @param t - The i18next translation function.
 * @returns An announcements object for use with DndContext's accessibility prop.
 */
export function createBoardAnnouncements(t: ReturnType<typeof useTranslation>['t']) {
  return {
    onDragStart: ({ active }: { active: { id: string | number } }) =>
      t('features.workItem.board.dragStart', { id: active.id }),
    onDragOver: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? t('features.workItem.board.dragOver', { id: active.id, column: over.id })
        : t('features.workItem.board.dragOverNothing', { id: active.id }),
    onDragEnd: ({
      active,
      over,
    }: {
      active: { id: string | number }
      over: { id: string | number } | null
    }) =>
      over
        ? t('features.workItem.board.dragEnd', { id: active.id, column: over.id })
        : t('features.workItem.board.dragCancelled', { id: active.id }),
    onDragCancel: ({ active }: { active: { id: string | number } }) =>
      t('features.workItem.board.dragCancelled', { id: active.id }),
  }
}
