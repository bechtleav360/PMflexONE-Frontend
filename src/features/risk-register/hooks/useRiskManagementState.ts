import { useMemo, useState } from 'react'

import type { RiskManagementFilterState } from '../types/registerRow.types'
import type { RiskEntry } from '../types/riskEntry.types'
import { sortRiskManagementRows, type RiskManagementSortState } from '../utils/riskManagementSort'

const DEFAULT_FILTER: RiskManagementFilterState = {
  type: null,
  status: null,
  pestelCategory: null,
  includeTerminalStatuses: false,
}

const DEFAULT_SORT: RiskManagementSortState = {
  field: 'entryNumber',
  direction: 'asc',
}

/**
 * Manages filter and sort state for the Risk Management area table.
 *
 * Filtering is now fully server-side: `filter.type`, `filter.status`, and
 * `filter.pestelCategory` are passed to `useRiskEntries` by the container so
 * the API returns only matching entries. `filter.includeTerminalStatuses` also
 * drives the server query. This hook only applies sorting to the pre-filtered
 * `entries` array received from the parent.
 *
 * @param entries - Pre-filtered list of risk/opportunity entries from the API.
 * @param initialFilter - Optional initial filter state.
 * @param initialSort - Optional initial sort state (defaults to entryNumber asc).
 * @returns Object with `rows`, `filter`, `setFilter`, `sort`, `setSort`.
 */
export function useRiskManagementState(
  entries: RiskEntry[],
  initialFilter: RiskManagementFilterState = DEFAULT_FILTER,
  initialSort: RiskManagementSortState = DEFAULT_SORT,
) {
  const [filter, setFilter] = useState<RiskManagementFilterState>(initialFilter)
  const [sort, setSort] = useState<RiskManagementSortState>(initialSort)

  const rows = useMemo(() => sortRiskManagementRows(entries, sort), [entries, sort])

  return { rows, filter, setFilter, sort, setSort }
}
