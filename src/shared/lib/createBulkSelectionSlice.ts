/**
 * Factory that creates a reusable Zustand bulk-selection slice.
 * Shared between rasciMatrixStore and roleManagementStore.
 */
/** Minimum shape a bulk-selectable cell must satisfy. */
export interface BulkCell {
  roleId: string
  taskId: string
}

/**
 * Zustand state shape for bulk cell selection.
 * @property bulkSelectedCells - Map of `"roleId:taskId"` keys to selected cell objects.
 * @property isBulkMode - Whether the user is in explicit multi-select mode.
 * @property bulkContextLabel - Optional label describing the current bulk context (e.g. task group name).
 */
export interface BulkSelectionState<TCell extends BulkCell> {
  bulkSelectedCells: Map<string, TCell>
  isBulkMode: boolean
  bulkContextLabel: string | null
}

/**
 * Zustand actions for bulk cell selection.
 * @property toggleBulkCell - Toggle a single cell in or out of the selection.
 * @property toggleBulkMode - Toggle bulk mode on/off, clearing the selection when toggled.
 * @property clearBulkSelection - Deselect all cells and reset the context label.
 */
export interface BulkSelectionActions<TCell extends BulkCell> {
  toggleBulkCell: (cell: TCell) => void
  toggleBulkMode: () => void
  clearBulkSelection: () => void
}

/**
 * Creates the bulk-selection state and actions for a Zustand store.
 * Handles toggling individual cells, toggling bulk mode, and clearing the selection.
 *
 * @param set - The Zustand `set` function bound to a state that extends `BulkSelectionState<TCell>`.
 * @returns Combined initial state and action implementations for bulk selection.
 */
export function createBulkSelectionSlice<TCell extends BulkCell>(
  set: (fn: (state: BulkSelectionState<TCell>) => Partial<BulkSelectionState<TCell>>) => void,
): BulkSelectionActions<TCell> & BulkSelectionState<TCell> {
  return {
    bulkSelectedCells: new Map(),
    isBulkMode: false,
    bulkContextLabel: null,
    toggleBulkCell: (cell: TCell) => {
      set((state) => {
        const key = `${cell.roleId}:${cell.taskId}`
        const next = new Map(state.bulkSelectedCells)
        if (next.has(key)) {
          next.delete(key)
        } else {
          next.set(key, cell)
        }
        return { bulkSelectedCells: next }
      })
    },
    toggleBulkMode: () =>
      set((state) => ({
        isBulkMode: !state.isBulkMode,
        bulkSelectedCells: new Map(),
      })),
    clearBulkSelection: () => set(() => ({ bulkSelectedCells: new Map(), bulkContextLabel: null })),
  }
}
