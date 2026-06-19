import { useMemo, useState } from 'react'

import type { ProblemEntry } from '../types/problemEntry.types'
import type { ProblemManagementFilterState, SortDirection } from '../types/registerRow.types'

/** Sort field options for the Problem Management area table. */
export type ProblemManagementSortField = 'entryNumber' | 'identificationDate'

/** Sort state shape used by useProblemManagementState. */
export interface ProblemManagementSortState {
  field: ProblemManagementSortField
  direction: SortDirection
}

const DEFAULT_FILTER: ProblemManagementFilterState = {
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

const DEFAULT_SORT: ProblemManagementSortState = {
  field: 'entryNumber',
  direction: 'asc',
}

/**
 * Sorts an array of problem entries by the active sort field.
 *
 * @param rows - The problem entries to sort.
 * @param sort - The active sort field and direction.
 * @returns A new sorted array of problem entries.
 */
export function sortProblemManagementRows(
  rows: ProblemEntry[],
  sort: ProblemManagementSortState,
): ProblemEntry[] {
  return [...rows].sort((a, b) => {
    if (sort.field === 'identificationDate') {
      const cmp = a.identificationDate.localeCompare(b.identificationDate)
      return sort.direction === 'asc' ? cmp : -cmp
    }
    const cmp = a.entryNumber.localeCompare(b.entryNumber)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

/**
 * Manages filter and sort state for the Problem Management area table.
 *
 * Filtering is now fully server-side: `filter.status` and `filter.pestelCategory`
 * are passed to `useProblemEntries` by the container so the API returns only
 * matching entries. `filter.includeTerminalStatuses` also drives the server
 * query. This hook only applies sorting to the pre-filtered `entries` array
 * received from the parent.
 *
 * @param entries - Pre-filtered list of problem entries from the API.
 * @param initialFilter - Optional initial filter state.
 * @param initialSort - Optional initial sort state (defaults to entryNumber asc).
 * @returns Object with `rows`, `filter`, `setFilter`, `sort`, `setSort`.
 */
export function useProblemManagementState(
  entries: ProblemEntry[],
  initialFilter: ProblemManagementFilterState = DEFAULT_FILTER,
  initialSort: ProblemManagementSortState = DEFAULT_SORT,
) {
  const [filter, setFilter] = useState<ProblemManagementFilterState>(initialFilter)
  const [sort, setSort] = useState<ProblemManagementSortState>(initialSort)

  const rows = useMemo(() => sortProblemManagementRows(entries, sort), [entries, sort])

  return { rows, filter, setFilter, sort, setSort }
}
