import { useMemo, useState } from 'react'

import type { IssueEntry } from '../types/issueEntry.types'
import type { IssueManagementFilterState, SortDirection } from '../types/registerRow.types'

/** Sort field options for the Issue Management area table. */
export type IssueManagementSortField = 'urgency' | 'entryNumber' | 'identificationDate'

/** Sort state shape used by useIssueManagementState. */
export interface IssueManagementSortState {
  field: IssueManagementSortField
  direction: SortDirection
}

const DEFAULT_FILTER: IssueManagementFilterState = {
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

const DEFAULT_SORT: IssueManagementSortState = {
  field: 'entryNumber',
  direction: 'asc',
}

/**
 * Sorts an array of issue entries by the active sort field.
 *
 * When sorting by urgency, entries with a null urgency sort to the bottom
 * regardless of sort direction.
 *
 * @param rows - The issue entries to sort.
 * @param sort - The active sort field and direction.
 * @returns A new sorted array of issue entries.
 */
export function sortIssueManagementRows(
  rows: IssueEntry[],
  sort: IssueManagementSortState,
): IssueEntry[] {
  return [...rows].sort((a, b) => {
    if (sort.field === 'urgency') {
      const aVal = a.urgency
      const bVal = b.urgency
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    if (sort.field === 'identificationDate') {
      const cmp = a.identificationDate.localeCompare(b.identificationDate)
      return sort.direction === 'asc' ? cmp : -cmp
    }

    const cmp = a.entryNumber.localeCompare(b.entryNumber)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

/**
 * Manages filter and sort state for the Issue Management area table.
 *
 * Filtering is now fully server-side: `filter.status` and `filter.pestelCategory`
 * are passed to `useIssueEntries` by the container so the API returns only
 * matching entries. `filter.includeTerminalStatuses` also drives the server
 * query. This hook only applies sorting to the pre-filtered `entries` array
 * received from the parent.
 *
 * @param entries - Pre-filtered list of issue entries from the API.
 * @param initialFilter - Optional initial filter state.
 * @param initialSort - Optional initial sort state (defaults to entryNumber asc).
 * @returns Object with `rows`, `filter`, `setFilter`, `sort`, `setSort`.
 */
export function useIssueManagementState(
  entries: IssueEntry[],
  initialFilter: IssueManagementFilterState = DEFAULT_FILTER,
  initialSort: IssueManagementSortState = DEFAULT_SORT,
) {
  const [filter, setFilter] = useState<IssueManagementFilterState>(initialFilter)
  const [sort, setSort] = useState<IssueManagementSortState>(initialSort)

  const rows = useMemo(() => sortIssueManagementRows(entries, sort), [entries, sort])

  return { rows, filter, setFilter, sort, setSort }
}
