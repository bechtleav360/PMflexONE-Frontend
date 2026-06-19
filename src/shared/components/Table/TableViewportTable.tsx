import * as React from 'react'
import { createPortal } from 'react-dom'

import { closestCenter, DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core'

import { TableHeaderDragOverlay } from './TableHeaderDragOverlay'
import type { TableColumn, TableColumnReorderPlacement, TableProps } from './TableTypes'
import { TableViewportTableInner } from './TableViewportTableInner'
import type { TableSelectionStateResult } from './useTableSelectionState'
import { useTableViewportDnd } from './useTableViewportDnd'

interface TableViewportTableProps<T> {
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
}

const DND_MEASURING_CONFIG = { droppable: { strategy: MeasuringStrategy.WhileDragging } }

/**
 * Renders the `<table>` element inside the viewport, including the header, body, colgroup,
 * and dnd-kit drag context for column reordering.
 * @param props - Table rendering inputs.
 * @returns The rendered table element wrapped in a `DndContext`.
 */
export function TableViewportTable<T>(props: TableViewportTableProps<T>) {
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
    handleColumnReorder,
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
  } = props

  const {
    sensors,
    activeColumn,
    activeColumnId,
    dropTarget,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  } = useTableViewportDnd({ isColumnReorderingEnabled, orderedColumns, handleColumnReorder })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={DND_MEASURING_CONFIG}
    >
      <TableViewportTableInner<T>
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
        dropTarget={dropTarget}
        activeColumnId={activeColumnId}
      />
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeColumn ? <TableHeaderDragOverlay header={activeColumn.header} /> : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
