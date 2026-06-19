import type { TableColumn, TableSortDirection, TableSortState } from './TableTypes'
import { getTableAlignmentClassName, getTableColumnLabel } from './tableUtils'

/** Collection of pure helper functions used by TableHeaderCell for class names, styles, and sort state. */
export const TableHeaderCellUtils = {
  canReorderColumn<T>(column: TableColumn<T>, enableColumnReordering: boolean) {
    return Boolean(enableColumnReordering && column.reorderable !== false)
  },
  canResizeColumn<T>(column: TableColumn<T>, enableColumnResizing: boolean) {
    return Boolean(enableColumnResizing && column.resizable !== false)
  },
  getSortDirection<T>(
    sort: TableSortState | null | undefined,
    column: TableColumn<T>,
  ): TableSortDirection | null {
    const sortKey = column.sortKey ?? column.id
    return sort?.field === sortKey ? sort.direction : null
  },
  getNextSortState<T>(
    column: TableColumn<T>,
    sort: TableSortState | null | undefined,
  ): TableSortState {
    const sortKey = column.sortKey ?? column.id

    if (sort?.field === sortKey) {
      return {
        field: sortKey,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      }
    }

    return {
      field: sortKey,
      direction: 'asc',
    }
  },
  getAriaSortValue(sortDirection: TableSortDirection | null) {
    if (sortDirection === 'asc') {
      return 'ascending'
    }

    if (sortDirection === 'desc') {
      return 'descending'
    }

    return 'none'
  },
  getSortLabel<T>(
    column: TableColumn<T>,
    sortDirection: TableSortDirection | null,
    t: (key: string, options?: { label: string }) => string,
  ) {
    const sortLabel = column.sortLabel ?? getTableColumnLabel(column)
    const translationKey =
      sortDirection === 'asc'
        ? 'shared.table.sortedAscending'
        : sortDirection === 'desc'
          ? 'shared.table.sortedDescending'
          : 'shared.table.sortBy'

    return t(translationKey, { label: sortLabel })
  },
  getClassName<T>({
    column,
    stickyHeader,
    isOver,
    isDragging,
  }: {
    column: TableColumn<T>
    stickyHeader: boolean
    isOver: boolean
    isDragging: boolean
  }) {
    return [
      'group relative h-12 select-none whitespace-nowrap px-lg text-left align-middle',
      'text-xs font-bold uppercase tracking-[0.04em] text-muted-foreground',
      // box-shadow instead of border-bottom when sticky: box shadows are painted on
      // the element and stick with it, whereas border-bottom on a collapsed table
      // boundary scrolls with the body.
      stickyHeader
        ? 'shadow-[inset_0_-2px_0_var(--color-border-strong)] bg-muted sticky z-20'
        : 'border-b-2 border-b-border-strong bg-muted',
      isDragging ? '!bg-card opacity-40' : '',
      isOver ? '!bg-primary-soft' : '',
      getTableAlignmentClassName(column.align),
      column.headerClassName ?? '',
    ]
      .filter(Boolean)
      .join(' ')
  },
  getStyle(props: { isDragging: boolean; stickyHeader: boolean; stickyHeaderOffset: number }) {
    const { isDragging, stickyHeader, stickyHeaderOffset } = props

    return {
      // No CSS transforms: table cells cannot be animated via transform without
      // breaking table layout. DragOverlay handles the visual drag representation.
      zIndex: isDragging ? 50 : undefined,
      top: stickyHeader ? stickyHeaderOffset : undefined,
    }
  },
}
