import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import type { TableColumn, TableColumnReorderPlacement, TableProps } from './TableTypes'
import { TableViewportTable } from './TableViewportTable'
import type { TableSelectionStateResult } from './useTableSelectionState'

interface TableViewportProps<T> {
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
}

function getTableContainerClassName(isVirtualized: boolean, containerClassName?: string) {
  return cn(isVirtualized ? 'overflow-auto' : 'overflow-x-auto', containerClassName)
}

/**
 * Renders the table viewport, including the header, body, and scroll container.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Viewport rendering inputs.
 * @returns The rendered table viewport.
 */
export function TableViewport<T>(props: TableViewportProps<T>) {
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
  } = props

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        className={cn(
          getTableContainerClassName(isVirtualized, containerClassName),
          isColumnResizing && 'select-none',
        )}
        onScroll={handleScroll}
        style={containerStyle}
      >
        <TableViewportTable<T>
          tableClassName={tableClassName}
          headerRowClassName={headerRowClassName}
          orderedColumns={orderedColumns}
          columnWidths={columnWidths}
          sort={sort}
          onSortChange={onSortChange}
          selection={selection}
          isVirtualized={isVirtualized}
          isColumnReorderingEnabled={isColumnReorderingEnabled}
          isColumnResizingEnabled={isColumnResizingEnabled}
          handleColumnReorder={handleColumnReorder}
          handleColumnResizePointerDown={handleColumnResizePointerDown}
          handleColumnResizeKeyDown={handleColumnResizeKeyDown}
          resizingColumnId={resizingColumnId}
          stickyHeader={stickyHeader}
          stickyHeaderOffset={stickyHeaderOffset}
          rowClassName={rowClassName}
          cellClassName={cellClassName}
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
      </div>
    </div>
  )
}
