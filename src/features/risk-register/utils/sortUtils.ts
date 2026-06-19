import type { TableSortState } from '@/shared/components'

/**
 * Narrows a generic TableSortState to a feature-specific typed sort state,
 * ignoring unsupported fields and null clears.
 *
 * @param next - The new sort state from the table, or null to clear.
 * @param onSortChange - Feature-specific sort change callback.
 * @param validFields - Fields accepted by the feature sort state.
 */
export function narrowSortChange<F extends string>(
  next: TableSortState | null,
  onSortChange: ((s: { field: F; direction: 'asc' | 'desc' }) => void) | undefined,
  validFields: F[],
): void {
  if (!next || !onSortChange) return
  if (validFields.includes(next.field as F)) {
    onSortChange({ field: next.field as F, direction: next.direction })
  }
}
