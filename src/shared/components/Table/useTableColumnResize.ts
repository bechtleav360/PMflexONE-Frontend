import type * as React from 'react'

import type { TableColumn } from './TableTypes'
import { useTableColumnResizeInteractions } from './useTableColumnResizeInteractions'
import { useTableColumnResizeState } from './useTableColumnResizeState'

interface UseTableColumnResizeParams<T> {
  columns: TableColumn<T>[]
  enableColumnResizing?: boolean
}

interface UseTableColumnResizeResult<T> {
  columnWidths: Record<string, number>
  isColumnResizingEnabled: boolean
  isColumnResizing: boolean
  resizingColumnId: string | null
  handleColumnResizePointerDown: (
    column: TableColumn<T>,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void
  handleColumnResizeKeyDown: (
    column: TableColumn<T>,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => void
}

/**
 * Coordinates shared table column resizing for controlled and uncontrolled usage.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Column resize configuration.
 * @returns The width map and resize interaction handlers.
 */
export function useTableColumnResize<T>(
  params: UseTableColumnResizeParams<T>,
): UseTableColumnResizeResult<T> {
  const { columns, enableColumnResizing = false } = params
  const { columnWidths, resizingColumnId, setColumnWidth, setResizingColumnId, columnWidthsRef } =
    useTableColumnResizeState(columns)
  const {
    isColumnResizingEnabled,
    isColumnResizing,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
  } = useTableColumnResizeInteractions({
    enabled: enableColumnResizing,
    resizingColumnId,
    columnWidthsRef,
    setColumnWidth,
    setResizingColumnId,
  })

  return {
    columnWidths,
    isColumnResizingEnabled,
    isColumnResizing,
    resizingColumnId,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
  }
}
