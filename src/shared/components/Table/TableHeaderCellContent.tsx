import type { KeyboardEvent, PointerEvent } from 'react'

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'

import { cn } from '@/shared/lib/utils'

import { TableHeaderReorderHandle } from './TableHeaderReorderHandle'
import { TableHeaderResizeHandle } from './TableHeaderResizeHandle'
import { TableHeaderSortButton } from './TableHeaderSortButton'
import { TableHeaderStaticLabel } from './TableHeaderStaticLabel'
import type { TableColumn, TableSortDirection, TableSortState } from './TableTypes'
import { getTableJustifyClassName } from './tableUtils'

interface TableHeaderCellContentProps<T> {
  column: TableColumn<T>
  sortDirection: TableSortDirection | null
  sortLabel: string
  onSortChange?: (sort: TableSortState | null) => void
  nextSortState: TableSortState | null
  isDraggedColumn: boolean
  canReorderColumn: boolean
  canResizeColumn: boolean
  dragHandleAttributes: DraggableAttributes
  dragHandleListeners?: DraggableSyntheticListeners
  setDragHandleNodeRef: (node: HTMLElement | null) => void
  onResizeHandlePointerDown: (
    column: TableColumn<T>,
    event: PointerEvent<HTMLButtonElement>,
  ) => void
  onResizeHandleKeyDown: (column: TableColumn<T>, event: KeyboardEvent<HTMLButtonElement>) => void
  isResizingColumn: boolean
  t: (key: string, options?: { label: string }) => string
}

/**
 * Renders the inner content of a table header cell: reorder handle, sort button or label, and resize handle.
 * @param props - Header cell content props.
 * @returns A div with the appropriate controls based on column configuration.
 */
export function TableHeaderCellContent<T>(props: TableHeaderCellContentProps<T>) {
  const {
    column,
    sortDirection,
    sortLabel,
    onSortChange,
    nextSortState,
    isDraggedColumn,
    canReorderColumn,
    canResizeColumn,
    dragHandleAttributes,
    dragHandleListeners,
    setDragHandleNodeRef,
    onResizeHandlePointerDown,
    onResizeHandleKeyDown,
    isResizingColumn,
    t,
  } = props
  const resizeHandleKeyboardHelpText = t('shared.table.resizeColumnKeyboardHint')
  return (
    <div
      className={cn(
        'gap-sm relative flex w-full items-center',
        getTableJustifyClassName(column.align),
        canResizeColumn && 'pr-md',
      )}
    >
      <TableHeaderReorderHandle
        column={column}
        canReorderColumn={canReorderColumn}
        isDragging={isDraggedColumn}
        dragHandleAttributes={dragHandleAttributes}
        dragHandleListeners={dragHandleListeners}
        setDragHandleNodeRef={setDragHandleNodeRef}
        t={t}
      />
      {column.sortable ? (
        <TableHeaderSortButton
          column={column}
          sortDirection={sortDirection}
          sortLabel={sortLabel}
          onSortChange={onSortChange}
          nextSortState={nextSortState}
          isDragging={isDraggedColumn}
        />
      ) : (
        <TableHeaderStaticLabel column={column} />
      )}
      {canResizeColumn ? (
        <TableHeaderResizeHandle
          column={column}
          isResizing={isResizingColumn}
          onPointerDown={onResizeHandlePointerDown}
          onKeyDown={onResizeHandleKeyDown}
          keyboardHelpText={resizeHandleKeyboardHelpText}
          t={t}
        />
      ) : null}
    </div>
  )
}
