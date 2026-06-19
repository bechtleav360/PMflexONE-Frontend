import type { KeyboardEvent, PointerEvent } from 'react'

import { useSortable } from '@dnd-kit/sortable'

import { TableHeaderCellContent } from './TableHeaderCellContent'
import { TableHeaderCellUtils } from './TableHeaderCellUtils'
import type { TableColumn, TableSortState } from './TableTypes'

interface TableHeaderCellProps<T> {
  column: TableColumn<T>
  sort?: TableSortState | null
  onSortChange?: (sort: TableSortState | null) => void
  enableColumnReordering?: boolean
  enableColumnResizing?: boolean
  stickyHeader?: boolean
  stickyHeaderOffset?: number
  onColumnResizePointerDown: (
    column: TableColumn<T>,
    event: PointerEvent<HTMLButtonElement>,
  ) => void
  onColumnResizeKeyDown: (column: TableColumn<T>, event: KeyboardEvent<HTMLButtonElement>) => void
  isResizingColumn: boolean
  dropLineSide?: 'before' | 'after' | null
  t: (key: string, options?: { label: string }) => string
}

/**
 * Renders a single header cell with optional sorting, reordering, and resize controls.
 * @param props - Header cell options.
 * @returns The rendered `<th>` element.
 */
export function TableHeaderCell<T>(props: TableHeaderCellProps<T>) {
  const {
    column,
    sort,
    onSortChange,
    enableColumnReordering = false,
    enableColumnResizing = false,
    stickyHeader = false,
    stickyHeaderOffset = 0,
    onColumnResizePointerDown,
    onColumnResizeKeyDown,
    isResizingColumn,
    dropLineSide = null,
    t,
  } = props

  const canReorderColumn = TableHeaderCellUtils.canReorderColumn(column, enableColumnReordering)
  const canResizeColumn = TableHeaderCellUtils.canResizeColumn(column, enableColumnResizing)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver } =
    useSortable({
      id: column.id,
      disabled: !canReorderColumn,
    })

  const sortDirection = TableHeaderCellUtils.getSortDirection(sort, column)
  const sortLabel = TableHeaderCellUtils.getSortLabel(column, sortDirection, t)
  const nextSortState = onSortChange ? TableHeaderCellUtils.getNextSortState(column, sort) : null

  const style = TableHeaderCellUtils.getStyle({
    isDragging,
    stickyHeader,
    stickyHeaderOffset,
  })

  return (
    <th
      ref={setNodeRef}
      className={TableHeaderCellUtils.getClassName({
        column,
        stickyHeader,
        isOver,
        isDragging,
      })}
      style={style}
      scope="col"
      aria-sort={TableHeaderCellUtils.getAriaSortValue(sortDirection)}
    >
      {dropLineSide === 'before' && (
        <span
          className="bg-primary pointer-events-none absolute inset-y-1 -left-px z-20 w-0.5 rounded-sm shadow-[var(--shadow-drop-indicator)]"
          aria-hidden="true"
        />
      )}
      {dropLineSide === 'after' && (
        <span
          className="bg-primary pointer-events-none absolute inset-y-1 -right-px z-20 w-0.5 rounded-sm shadow-[var(--shadow-drop-indicator)]"
          aria-hidden="true"
        />
      )}
      <TableHeaderCellContent
        column={column}
        sortDirection={sortDirection}
        sortLabel={sortLabel}
        onSortChange={onSortChange}
        nextSortState={nextSortState}
        isDraggedColumn={isDragging}
        canReorderColumn={canReorderColumn}
        canResizeColumn={canResizeColumn}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        setDragHandleNodeRef={setActivatorNodeRef}
        onResizeHandlePointerDown={onColumnResizePointerDown}
        onResizeHandleKeyDown={onColumnResizeKeyDown}
        isResizingColumn={isResizingColumn}
        t={t}
      />
    </th>
  )
}
