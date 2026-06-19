import type { TFunction } from 'i18next'

import type { TableSortState } from '@/shared/components'

/**
 * Row shape used by the table showcase example.
 */
export interface ShowcaseTableRow {
  id: string
  name: string
  status: 'active' | 'scheduled' | 'paused'
  score: number
  updatedAt: string
}

/**
 * Badge variants used for the showcase status column.
 */
export const STATUS_VARIANTS = {
  active: 'default',
  scheduled: 'secondary',
  paused: 'outline',
} as const

const STATUS_SORT_ORDER = {
  active: 0,
  scheduled: 1,
  paused: 2,
} as const

function compareValues(left: string | number, right: string | number, direction: 'asc' | 'desc') {
  const leftValue =
    typeof left === 'string' ? left.localeCompare(right as string) : left - (right as number)
  return direction === 'asc' ? leftValue : -leftValue
}

/**
 * Builds the localized showcase rows used by the table demo.
 *
 * @param t - Translation function used for row labels.
 * @returns A fixed set of sample rows.
 */
export function createShowcaseTableRows(t: TFunction): ShowcaseTableRow[] {
  const statuses: ShowcaseTableRow['status'][] = ['active', 'scheduled', 'paused']

  return Array.from({ length: 40 }, (_, index) => {
    const id = index + 1
    const dayOffset = index % 28
    const hourOffset = index % 12
    const formattedId = String(id).padStart(2, '0')

    return {
      id: formattedId,
      name: t('showcase.table.rowLabel', { id: formattedId }),
      status: statuses[index % statuses.length],
      score: 100 - index,
      updatedAt: new Date(2026, 3, 1 + dayOffset, 8 + hourOffset, 15).toISOString(),
    }
  })
}

/**
 * Sorts the showcase rows by the active table sort state.
 *
 * @param rows - Rows to sort.
 * @param sort - Active sort state.
 * @returns A new sorted array.
 */
export function sortShowcaseTableRows(
  rows: ShowcaseTableRow[],
  sort: TableSortState | null,
): ShowcaseTableRow[] {
  if (!sort) {
    return rows
  }

  const nextRows = [...rows]

  nextRows.sort((left, right) => {
    if (sort.field === 'name') {
      return compareValues(left.name, right.name, sort.direction)
    }

    if (sort.field === 'status') {
      return compareValues(
        STATUS_SORT_ORDER[left.status],
        STATUS_SORT_ORDER[right.status],
        sort.direction,
      )
    }

    if (sort.field === 'score') {
      return compareValues(left.score, right.score, sort.direction)
    }

    return compareValues(
      new Date(left.updatedAt).getTime(),
      new Date(right.updatedAt).getTime(),
      sort.direction,
    )
  })

  return nextRows
}
