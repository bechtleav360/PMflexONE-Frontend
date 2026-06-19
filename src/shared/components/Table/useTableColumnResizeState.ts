import * as React from 'react'

import type { TableColumn } from './TableTypes'
import { clampTableColumnWidth, createTableColumnWidths } from './tableUtils'

interface UseTableColumnResizeStateResult<T> {
  columnWidths: Record<string, number>
  resizingColumnId: string | null
  setColumnWidth: (column: TableColumn<T>, width: number) => void
  setResizingColumnId: React.Dispatch<React.SetStateAction<string | null>>
  columnWidthsRef: React.RefObject<Record<string, number>>
}

/**
 * Keeps the current table column widths in sync with the column definitions.
 *
 * @template T - Row shape rendered by the table.
 * @param columns - Table columns to initialize and maintain widths for.
 * @returns The width state, ref, and setters used by the resize interactions.
 */
export function useTableColumnResizeState<T>(
  columns: TableColumn<T>[],
): UseTableColumnResizeStateResult<T> {
  const [columnWidths, setColumnWidths] = React.useState(() => createTableColumnWidths(columns))
  const [resizingColumnId, setResizingColumnId] = React.useState<string | null>(null)
  const columnWidthsRef = React.useRef(columnWidths)

  React.useEffect(() => {
    setColumnWidths((currentColumnWidths) => createTableColumnWidths(columns, currentColumnWidths))
  }, [columns])

  React.useEffect(() => {
    columnWidthsRef.current = columnWidths
  }, [columnWidths])

  const setColumnWidth = React.useCallback((column: TableColumn<T>, width: number) => {
    setColumnWidths((currentColumnWidths) => {
      const nextWidth = clampTableColumnWidth(column, width)

      if (currentColumnWidths[column.id] === nextWidth) {
        return currentColumnWidths
      }

      return {
        ...currentColumnWidths,
        [column.id]: nextWidth,
      }
    })
  }, [])

  return {
    columnWidths,
    resizingColumnId,
    setColumnWidth,
    setResizingColumnId,
    columnWidthsRef,
  }
}
