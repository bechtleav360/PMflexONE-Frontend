import type { Key } from 'react'

import { cn } from '@/shared/lib/utils'

import { TableEmptyState } from './TableEmptyState'
import { TableSelectionCheckbox } from './TableSelectionCheckbox'
import { TableSkeletonRow } from './TableSkeletonRow'
import type { TableColumn } from './TableTypes'
import { getTableAlignmentClassName } from './tableUtils'
import type { TableSelectionStateResult } from './useTableSelectionState'

interface TableBodyProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => Key
  selection: TableSelectionStateResult<T>
  loading: boolean
  loadingRowsCount: number
  rowClassName?: string
  cellClassName?: string
  isVirtualized: boolean
  virtualStartIndex: number
  visibleRows: T[]
  topSpacerHeight: number
  bottomSpacerHeight: number
  safeColumnSpan: number
  emptyTitle: string
  emptyDescription: string
  draggingColumnId: string | null
}

function renderLoadingRows<T>(
  columns: TableColumn<T>[],
  selection: TableSelectionStateResult<T>,
  loadingRowsCount: number,
  rowClassName?: string,
  cellClassName?: string,
) {
  return Array.from({ length: loadingRowsCount }).map((_, index) => (
    <TableSkeletonRow
      key={`loading-row-${index}`}
      columns={columns}
      selection={selection}
      rowClassName={rowClassName}
      cellClassName={cellClassName}
    />
  ))
}

function renderVirtualizedSpacer(columnSpan: number, height: number) {
  if (height <= 0) {
    return null
  }

  return (
    <tr aria-hidden="true">
      <td
        style={{ height: `${height}px` }}
        colSpan={columnSpan}
      />
    </tr>
  )
}

function renderTableRow<T>({
  row,
  index,
  virtualStartIndex,
  isVirtualized,
  columns,
  selection,
  rowClassName,
  cellClassName,
  getRowKey,
  draggingColumnId,
}: {
  row: T
  index: number
  virtualStartIndex: number
  isVirtualized: boolean
  columns: TableColumn<T>[]
  selection: TableSelectionStateResult<T>
  rowClassName?: string
  cellClassName?: string
  getRowKey: (row: T, index: number) => Key
  draggingColumnId: string | null
}) {
  const actualIndex = isVirtualized ? virtualStartIndex + index : index
  const isRowSelected = selection.isSelectionEnabled && selection.isRowSelected(row, actualIndex)
  const isRowSelectable =
    selection.isSelectionEnabled && selection.isRowSelectable(row, actualIndex)

  return (
    <tr
      key={getRowKey(row, actualIndex)}
      aria-selected={isRowSelected ? 'true' : undefined}
      className={cn(
        // Borders live on td, not tr, so they work with border-separate (the table
        // default). The group class lets td use group-last: to drop the border on the
        // final row without border-collapse side-effects on the sticky header.
        'group hover:bg-background transition-colors',
        isRowSelected && 'bg-primary/5',
        rowClassName,
      )}
    >
      {selection.isSelectionEnabled ? (
        <td className="border-border px-lg w-12 border-b text-center align-middle group-last:border-b-0">
          <TableSelectionCheckbox
            checked={isRowSelected}
            aria-label={selection.getRowSelectionLabel(row, actualIndex)}
            disabled={!selection.isSelectionInteractive || !isRowSelectable}
            onCheckedChange={(checked) =>
              selection.handleRowSelectionChange(row, actualIndex, checked === true)
            }
          />
        </td>
      ) : null}
      {columns.map((column) => (
        <td
          key={column.id}
          className={cn(
            'border-border p-lg border-b align-middle group-last:border-b-0',
            'transition-opacity duration-150',
            draggingColumnId === column.id && 'opacity-40',
            getTableAlignmentClassName(column.align),
            column.truncate && 'max-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
            cellClassName,
            column.cellClassName,
          )}
        >
          {column.cell(row)}
        </td>
      ))}
    </tr>
  )
}

/**
 * Renders the table body including loading skeletons, empty state, and virtualized rows.
 * @param props - Body configuration.
 * @returns The rendered table body fragment.
 */
export function TableBody<T>(props: TableBodyProps<T>) {
  const {
    columns,
    rows,
    getRowKey,
    selection,
    loading,
    loadingRowsCount,
    rowClassName,
    cellClassName,
    isVirtualized,
    virtualStartIndex,
    visibleRows,
    topSpacerHeight,
    bottomSpacerHeight,
    safeColumnSpan,
    emptyTitle,
    emptyDescription,
    draggingColumnId,
  } = props
  const hasRows = rows.length > 0

  if (loading) {
    return (
      <>{renderLoadingRows(columns, selection, loadingRowsCount, rowClassName, cellClassName)}</>
    )
  }

  if (!hasRows) {
    return (
      <TableEmptyState
        columns={safeColumnSpan}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <>
      {renderVirtualizedSpacer(safeColumnSpan, isVirtualized ? topSpacerHeight : 0)}
      {visibleRows.map((row, index) =>
        renderTableRow({
          row,
          index,
          virtualStartIndex,
          isVirtualized,
          columns,
          selection,
          rowClassName,
          cellClassName,
          getRowKey,
          draggingColumnId,
        }),
      )}
      {renderVirtualizedSpacer(safeColumnSpan, isVirtualized ? bottomSpacerHeight : 0)}
    </>
  )
}
