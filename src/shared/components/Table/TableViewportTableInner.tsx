import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import { TableBody } from './TableBody'
import { TableHeader } from './TableHeader'
import type { TableColumn, TableProps } from './TableTypes'
import { DEFAULT_TABLE_COLUMN_WIDTH } from './tableUtils'
import type { TableSelectionStateResult } from './useTableSelectionState'
import type { DropTarget } from './useTableViewportDnd'

interface TableViewportTableInnerProps<T> {
  tableClassName?: string
  headerRowClassName?: string
  orderedColumns: TableProps<T>['columns']
  columnWidths: Record<string, number>
  sort?: TableProps<T>['sort']
  onSortChange?: TableProps<T>['onSortChange']
  selection: TableSelectionStateResult<T>
  isVirtualized: boolean
  isColumnReorderingEnabled: boolean
  isColumnResizingEnabled: boolean
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
  rowClassName?: string
  cellClassName?: string
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
  dropTarget: DropTarget | null
  activeColumnId: string | null
}

/**
 * Renders the `<table>` element with colgroup, header, and body.
 * @param props - Table inner rendering props.
 * @returns The rendered `<table>` element.
 */
export function TableViewportTableInner<T>(props: TableViewportTableInnerProps<T>) {
  const {
    tableClassName,
    headerRowClassName,
    orderedColumns,
    columnWidths,
    sort,
    onSortChange,
    selection,
    isVirtualized,
    isColumnReorderingEnabled,
    isColumnResizingEnabled,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
    resizingColumnId,
    stickyHeader,
    stickyHeaderOffset,
    rowClassName,
    cellClassName,
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
    dropTarget,
    activeColumnId,
  } = props

  return (
    <table
      className={cn(
        // border-separate (browser default) + border-spacing-0 keeps each cell's
        // border-bottom independent, so the sticky th border scrolls with the header
        // and does not collapse into the first body row.
        'caption-bottom border-spacing-0 text-sm',
        isColumnResizingEnabled ? 'w-max min-w-full table-fixed' : 'w-full',
        tableClassName,
      )}
    >
      {isColumnResizingEnabled ? (
        <colgroup>
          {selection.isSelectionEnabled ? <col style={{ width: '3rem' }} /> : null}
          {orderedColumns.map((column) => (
            <col
              key={column.id}
              style={{ width: `${columnWidths[column.id] ?? DEFAULT_TABLE_COLUMN_WIDTH}px` }}
            />
          ))}
        </colgroup>
      ) : null}
      <TableHeader<T>
        columns={orderedColumns}
        sort={sort}
        onSortChange={onSortChange}
        selection={selection}
        enableColumnReordering={isColumnReorderingEnabled}
        enableColumnResizing={isColumnResizingEnabled}
        onColumnResizePointerDown={handleColumnResizePointerDown}
        onColumnResizeKeyDown={handleColumnResizeKeyDown}
        resizingColumnId={resizingColumnId}
        stickyHeader={stickyHeader}
        stickyHeaderOffset={stickyHeaderOffset}
        headerRowClassName={headerRowClassName}
        dropTarget={dropTarget}
      />
      <tbody aria-busy={loading ? 'true' : 'false'}>
        <TableBody<T>
          columns={orderedColumns}
          rows={rows}
          getRowKey={getRowKey}
          selection={selection}
          loading={loading}
          loadingRowsCount={loadingRowsCount}
          rowClassName={rowClassName}
          cellClassName={cellClassName}
          isVirtualized={isVirtualized}
          virtualStartIndex={virtualStartIndex}
          visibleRows={visibleRows}
          topSpacerHeight={topSpacerHeight}
          bottomSpacerHeight={bottomSpacerHeight}
          safeColumnSpan={safeColumnSpan}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          draggingColumnId={activeColumnId}
        />
      </tbody>
    </table>
  )
}
