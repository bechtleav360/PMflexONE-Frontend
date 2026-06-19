import * as React from 'react'

import type { TableColumn } from './TableTypes'
import {
  createTableColumnResizeKeyDownHandler,
  createTableColumnResizePointerDownHandler,
} from './useTableColumnResizeHandlers'

interface UseTableColumnResizeInteractionsParams<T> {
  enabled: boolean
  resizingColumnId: string | null
  columnWidthsRef: React.RefObject<Record<string, number>>
  setColumnWidth: (column: TableColumn<T>, width: number) => void
  setResizingColumnId: React.Dispatch<React.SetStateAction<string | null>>
}

interface UseTableColumnResizeInteractionsResult<T> {
  isColumnResizingEnabled: boolean
  isColumnResizing: boolean
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
 * Handles pointer and keyboard interactions for table column resizing.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Resize interaction inputs.
 * @returns Resize interaction state and event handlers.
 */
export function useTableColumnResizeInteractions<T>(
  params: UseTableColumnResizeInteractionsParams<T>,
): UseTableColumnResizeInteractionsResult<T> {
  const { enabled, resizingColumnId, columnWidthsRef, setColumnWidth, setResizingColumnId } = params
  const isColumnResizingEnabled = Boolean(enabled)
  const handleColumnResizePointerDown = React.useMemo(
    () =>
      createTableColumnResizePointerDownHandler({
        enabled: isColumnResizingEnabled,
        columnWidthsRef,
        setColumnWidth,
        setResizingColumnId,
      }),
    [columnWidthsRef, isColumnResizingEnabled, setColumnWidth, setResizingColumnId],
  )

  const handleColumnResizeKeyDown = React.useMemo(
    () =>
      createTableColumnResizeKeyDownHandler({
        enabled: isColumnResizingEnabled,
        columnWidthsRef,
        setColumnWidth,
      }),
    [columnWidthsRef, isColumnResizingEnabled, setColumnWidth],
  )

  return {
    isColumnResizingEnabled,
    isColumnResizing: resizingColumnId !== null,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
  }
}
