import type { SortDirection } from '../types/registerRow.types'
import type { RiskEntry } from '../types/riskEntry.types'

/** Sort field options for the Risk Management area table. */
export type RiskManagementSortField = 'riskLevel' | 'entryNumber' | 'identificationDate'

/** Sort state shape used by useRiskManagementState. */
export interface RiskManagementSortState {
  field: RiskManagementSortField
  direction: SortDirection
}

/**
 * Sorts an array of risk/opportunity entries according to the active sort state.
 *
 * When sorting by riskLevel, entries with a null riskLevel sort to the bottom
 * regardless of sort direction (they have no calculable level).
 *
 * @param rows - The list of risk/opportunity entries to sort.
 * @param sort - The active sort field and direction.
 * @returns A new sorted array (original is not mutated).
 */
export function sortRiskManagementRows(
  rows: RiskEntry[],
  sort: RiskManagementSortState,
): RiskEntry[] {
  return [...rows].sort((a, b) => {
    if (sort.field === 'riskLevel') {
      const aLevel = a.riskLevel
      const bLevel = b.riskLevel
      // Null riskLevel always sorts to bottom regardless of direction.
      if (aLevel === null && bLevel === null) return 0
      if (aLevel === null) return 1
      if (bLevel === null) return -1
      return sort.direction === 'asc' ? aLevel - bLevel : bLevel - aLevel
    }

    if (sort.field === 'identificationDate') {
      const cmp = a.identificationDate.localeCompare(b.identificationDate)
      return sort.direction === 'asc' ? cmp : -cmp
    }

    // Default: sort by entryNumber
    const cmp = a.entryNumber.localeCompare(b.entryNumber)
    return sort.direction === 'asc' ? cmp : -cmp
  })
}
