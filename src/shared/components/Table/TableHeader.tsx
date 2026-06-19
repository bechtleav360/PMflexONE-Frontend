import * as React from 'react'

import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { TableHeaderCell } from './TableHeaderCell'
import { TableSelectionCheckbox } from './TableSelectionCheckbox'
import type { TableColumn, TableSortState } from './TableTypes'
import type { TableSelectionStateResult } from './useTableSelectionState'

interface DropTarget {
  id: string
  side: 'before' | 'after'
}

interface TableHeaderProps<T> {
  columns: TableColumn<T>[]
  sort?: TableSortState | null
  onSortChange?: (sort: TableSortState | null) => void
  selection: TableSelectionStateResult<T>
  enableColumnReordering?: boolean
  enableColumnResizing?: boolean
  onColumnResizePointerDown: (
    column: TableColumn<T>,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void
  onColumnResizeKeyDown: (
    column: TableColumn<T>,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => void
  resizingColumnId: string | null
  stickyHeader?: boolean
  stickyHeaderOffset?: number
  headerRowClassName?: string
  dropTarget?: DropTarget | null
}

function getSelectAllCheckedState<T>(selection: TableSelectionStateResult<T>) {
  if (selection.allSelectableRowsSelected) {
    return true
  }

  if (selection.someSelectableRowsSelected) {
    return 'indeterminate' as const
  }

  return false
}

function renderSelectionHeaderCell<T>(
  selection: TableSelectionStateResult<T>,
  stickyHeader: boolean,
  stickyHeaderOffset: number,
) {
  if (!selection.isSelectionEnabled) {
    return null
  }

  return (
    <th
      className={cn(
        'px-lg h-12 w-12 text-center align-middle whitespace-nowrap select-none',
        'text-muted-foreground text-[11px] font-bold',
        stickyHeader
          ? 'bg-muted sticky z-20 shadow-[inset_0_-2px_0_var(--color-border-strong)]'
          : 'border-b-border-strong bg-muted border-b-2',
      )}
      style={stickyHeader ? { top: stickyHeaderOffset } : undefined}
      scope="col"
    >
      {selection.selectionMode === 'multiple' ? (
        <TableSelectionCheckbox
          checked={getSelectAllCheckedState(selection)}
          aria-label={selection.selectAllLabel}
          disabled={!selection.isSelectionInteractive || selection.selectableRowKeys.length === 0}
          onCheckedChange={(checked) => selection.handleSelectAllChange(checked === true)}
        />
      ) : (
        <span className="sr-only">{selection.selectRowLabel}</span>
      )}
    </th>
  )
}

/**
 * Renders the table header row with optional sorting, column reordering, and column resizing.
 * @param props - Header configuration.
 * @returns The `<thead>` element wrapped in a dnd-kit `SortableContext`.
 */
export function TableHeader<T>(props: TableHeaderProps<T>) {
  const {
    columns,
    sort,
    onSortChange,
    selection,
    enableColumnReordering = false,
    enableColumnResizing = false,
    onColumnResizePointerDown,
    onColumnResizeKeyDown,
    resizingColumnId,
    stickyHeader = false,
    stickyHeaderOffset = 0,
    headerRowClassName,
    dropTarget,
  } = props
  const { t } = useTranslation()
  const columnIds = React.useMemo(() => columns.map((column) => column.id), [columns])

  return (
    <SortableContext
      items={columnIds}
      strategy={horizontalListSortingStrategy}
    >
      <thead className={cn(headerRowClassName)}>
        <tr>
          {renderSelectionHeaderCell(selection, stickyHeader, stickyHeaderOffset)}
          {columns.map((column) => (
            <TableHeaderCell
              key={column.id}
              column={column}
              sort={sort}
              onSortChange={onSortChange}
              enableColumnReordering={enableColumnReordering}
              enableColumnResizing={enableColumnResizing}
              stickyHeader={stickyHeader}
              stickyHeaderOffset={stickyHeaderOffset}
              onColumnResizePointerDown={onColumnResizePointerDown}
              onColumnResizeKeyDown={onColumnResizeKeyDown}
              isResizingColumn={resizingColumnId === column.id}
              dropLineSide={dropTarget?.id === column.id ? dropTarget.side : null}
              t={t}
            />
          ))}
        </tr>
      </thead>
    </SortableContext>
  )
}
