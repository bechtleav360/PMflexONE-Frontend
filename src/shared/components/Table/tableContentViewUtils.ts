import type * as React from 'react'

import type { TableContentViewProps } from './TableContentView'
import type { TableProps } from './TableTypes'
import type { TableSelectionStateResult } from './useTableSelectionState'

interface CreateTableContentViewPropsParams<T> {
  className?: string
  containerClassName?: string
  tableClassName?: string
  headerRowClassName?: string
  rowClassName?: string
  cellClassName?: string
  containerRef: React.RefObject<HTMLDivElement | null>
  containerStyle?: React.CSSProperties
  isColumnResizing: boolean
  isVirtualized: boolean
  handleScroll?: React.UIEventHandler<HTMLDivElement>
  orderedColumns: TableProps<T>['columns']
  columnWidths: Record<string, number>
  sort?: TableProps<T>['sort']
  onSortChange?: TableProps<T>['onSortChange']
  selection: TableSelectionStateResult<T>
  isColumnReorderingEnabled: boolean
  isColumnResizingEnabled: boolean
  handleColumnReorder: TableContentViewProps<T>['handleColumnReorder']
  handleColumnResizePointerDown: TableContentViewProps<T>['handleColumnResizePointerDown']
  handleColumnResizeKeyDown: TableContentViewProps<T>['handleColumnResizeKeyDown']
  resizingColumnId: string | null
  stickyHeader: boolean
  stickyHeaderOffset: number
  rows: TableProps<T>['rows']
  getRowKey: TableProps<T>['getRowKey']
  loading: boolean
  loadingRowsCount: number
  safeColumnSpan: number
  emptyTitle: string
  emptyDescription: string
  visibleRows: T[]
  virtualStartIndex: number
  topSpacerHeight: number
  bottomSpacerHeight: number
  pagination: TableProps<T>['pagination']
}

/**
 * Builds the props passed from `TableContent` to `TableContentView`.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Source table state.
 * @returns The view props.
 */
export function createTableContentViewProps<T>(
  params: CreateTableContentViewPropsParams<T>,
): TableContentViewProps<T> {
  const {
    className,
    containerClassName,
    tableClassName,
    headerRowClassName,
    rowClassName,
    cellClassName,
    containerRef,
    containerStyle,
    isColumnResizing,
    isVirtualized,
    handleScroll,
    orderedColumns,
    columnWidths,
    sort,
    onSortChange,
    selection,
    isColumnReorderingEnabled,
    isColumnResizingEnabled,
    handleColumnReorder,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
    resizingColumnId,
    stickyHeader,
    stickyHeaderOffset,
    rows,
    getRowKey,
    loading,
    loadingRowsCount,
    safeColumnSpan,
    emptyTitle,
    emptyDescription,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    pagination,
  } = params

  return {
    className,
    containerClassName,
    tableClassName,
    headerRowClassName,
    rowClassName,
    cellClassName,
    containerRef,
    containerStyle,
    isColumnResizing,
    isVirtualized,
    handleScroll,
    orderedColumns,
    columnWidths,
    sort,
    onSortChange,
    selection,
    isColumnReorderingEnabled,
    isColumnResizingEnabled,
    handleColumnReorder,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
    resizingColumnId,
    stickyHeader,
    stickyHeaderOffset,
    rows,
    getRowKey,
    loading,
    loadingRowsCount,
    safeColumnSpan,
    emptyTitle,
    emptyDescription,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    pagination,
  }
}
