import * as React from 'react'

import { TablePagination } from './TablePagination'
import type { TableColumn, TableColumnReorderPlacement, TableProps } from './TableTypes'
import { TableViewport } from './TableViewport'
import type { TableSelectionStateResult } from './useTableSelectionState'

/**
 * Props for the table content view.
 *
 * @template T - Row shape rendered by the table.
 */
export interface TableContentViewProps<T> {
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
  handleColumnReorder: (
    sourceColumnId: string,
    targetColumnId: string,
    placement: TableColumnReorderPlacement,
  ) => void
  handleColumnResizePointerDown: (
    column: TableColumn<T>,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void
  handleColumnResizeKeyDown: (
    column: TableColumn<T>,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => void
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
 * Renders the table viewport and pagination for the shared table.
 *
 * @template T - Row shape rendered by the table.
 * @param props - View rendering inputs.
 * @returns The rendered table content.
 */
export function TableContentView<T>(props: TableContentViewProps<T>) {
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
  } = props

  return (
    <div className={className}>
      <TableViewport<T>
        containerClassName={containerClassName}
        tableClassName={tableClassName}
        headerRowClassName={headerRowClassName}
        rowClassName={rowClassName}
        cellClassName={cellClassName}
        containerRef={containerRef}
        containerStyle={containerStyle}
        isColumnResizing={isColumnResizing}
        isVirtualized={isVirtualized}
        handleScroll={handleScroll}
        orderedColumns={orderedColumns}
        columnWidths={columnWidths}
        sort={sort}
        onSortChange={onSortChange}
        selection={selection}
        isColumnReorderingEnabled={isColumnReorderingEnabled}
        isColumnResizingEnabled={isColumnResizingEnabled}
        handleColumnReorder={handleColumnReorder}
        handleColumnResizePointerDown={handleColumnResizePointerDown}
        handleColumnResizeKeyDown={handleColumnResizeKeyDown}
        resizingColumnId={resizingColumnId}
        stickyHeader={stickyHeader}
        stickyHeaderOffset={stickyHeaderOffset}
        rows={rows}
        getRowKey={getRowKey}
        loading={loading}
        loadingRowsCount={loadingRowsCount}
        safeColumnSpan={safeColumnSpan}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        visibleRows={visibleRows}
        virtualStartIndex={virtualStartIndex}
        topSpacerHeight={topSpacerHeight}
        bottomSpacerHeight={bottomSpacerHeight}
      />

      {pagination ? <TablePagination pagination={pagination} /> : null}
    </div>
  )
}
