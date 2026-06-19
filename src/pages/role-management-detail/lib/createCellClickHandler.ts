import type React from 'react'

import type { PermissionKey } from '@/entities/role'

interface CellClickHandlerDeps {
  isReadOnly: boolean
  isBulkMode: boolean
  bulkCount: number
  clearBulkSelection: () => void
  toggleBulkCell: (cell: { roleId: string; taskId: string }) => void
  openTemplateCellEdit: (cell: {
    roleId: string
    taskId: string
    currentValue: PermissionKey
  }) => void
}

/**
 * Creates the cell-click handler for the role management detail page.
 * Handles single-cell edit, bulk mode selection, and ⌘/Ctrl-click multi-select.
 *
 * @param deps - Handler dependencies from the store and page state.
 * @returns A cell-click event handler function.
 */
export function createCellClickHandler(deps: CellClickHandlerDeps) {
  const {
    isReadOnly,
    isBulkMode,
    bulkCount,
    clearBulkSelection,
    toggleBulkCell,
    openTemplateCellEdit,
  } = deps
  return function handleCellClick(
    e: React.MouseEvent,
    roleId: string,
    taskId: string,
    currentValue: PermissionKey,
  ) {
    if (isReadOnly) return
    if (isBulkMode || e.metaKey || e.ctrlKey) {
      toggleBulkCell({ roleId, taskId })
    } else {
      if (bulkCount > 0) clearBulkSelection()
      openTemplateCellEdit({ roleId, taskId, currentValue })
    }
  }
}
