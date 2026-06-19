import type {
  TableAlignment,
  TableColumn,
  TableColumnReorderPlacement,
  TablePaginationRange,
} from './TableTypes'

/** Minimum default width in pixels for resizable table columns. */
export const DEFAULT_TABLE_COLUMN_MIN_WIDTH = 96
/** Default width in pixels for table columns that do not specify one. */
export const DEFAULT_TABLE_COLUMN_WIDTH = 180
/** Keyboard resize step in pixels for table columns. */
export const TABLE_COLUMN_RESIZE_STEP = 8

interface VirtualizedTableWindowParams<T> {
  rows: T[]
  scrollTop: number
  rowHeight: number
  overscan: number
  viewportHeight: number
}

interface VirtualizedTableWindowResult<T> {
  visibleRows: T[]
  virtualStartIndex: number
  topSpacerHeight: number
  bottomSpacerHeight: number
}

/**
 * Returns the pagination range shown in the table footer.
 *
 * @param page - The current page number.
 * @param pageSize - The number of rows per page.
 * @param totalItems - The total number of rows available.
 * @returns The displayed range and total page count.
 */
export function getPaginationRange(
  page: number,
  pageSize: number,
  totalItems: number,
): TablePaginationRange {
  if (totalItems === 0) {
    return { from: 0, to: 0, totalPages: 0 }
  }

  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const from = (safePage - 1) * safePageSize + 1
  const to = Math.min(safePage * safePageSize, totalItems)

  return { from, to, totalPages }
}

/**
 * Returns the text alignment class for a table cell.
 *
 * @param align - Optional alignment definition.
 * @returns The Tailwind text alignment utility class.
 */
export function getTableAlignmentClassName(align?: TableAlignment) {
  if (align === 'center') {
    return 'text-center'
  }

  if (align === 'right') {
    return 'text-right'
  }

  return 'text-left'
}

/**
 * Returns the flex justification class for an aligned header button.
 *
 * @param align - Optional alignment definition.
 * @returns The Tailwind justify-content utility class.
 */
export function getTableJustifyClassName(align?: TableAlignment) {
  if (align === 'center') {
    return 'justify-center'
  }

  if (align === 'right') {
    return 'justify-end'
  }

  return 'justify-start'
}

/**
 * Returns the best available label for a table column.
 *
 * @template T - Row shape rendered by the table.
 * @param column - Column definition.
 * @returns A human-readable label when available.
 */
export function getTableColumnLabel<T>(column: TableColumn<T>) {
  if (typeof column.header === 'string' || typeof column.header === 'number') {
    return String(column.header)
  }

  return column.sortLabel ?? column.id
}

/**
 * Returns the minimum width for a resizable table column.
 *
 * @template T - Row shape rendered by the table.
 * @param column - Column definition.
 * @returns The minimum width in pixels.
 */
export function getTableColumnMinWidth<T>(column: TableColumn<T>) {
  return Math.max(1, column.minWidth ?? DEFAULT_TABLE_COLUMN_MIN_WIDTH)
}

/**
 * Returns the maximum width for a resizable table column.
 *
 * @template T - Row shape rendered by the table.
 * @param column - Column definition.
 * @returns The maximum width in pixels, or Infinity when no cap is defined.
 */
export function getTableColumnMaxWidth<T>(column: TableColumn<T>) {
  return Math.max(getTableColumnMinWidth(column), column.maxWidth ?? Number.POSITIVE_INFINITY)
}

/**
 * Clamps a table column width to the supported bounds.
 *
 * @template T - Row shape rendered by the table.
 * @param column - Column definition.
 * @param width - Requested width in pixels.
 * @returns A valid width within the column bounds.
 */
export function clampTableColumnWidth<T>(column: TableColumn<T>, width: number) {
  return Math.min(getTableColumnMaxWidth(column), Math.max(getTableColumnMinWidth(column), width))
}

/**
 * Returns the initial width for a table column.
 *
 * @template T - Row shape rendered by the table.
 * @param column - Column definition.
 * @returns The starting width in pixels.
 */
export function getTableColumnInitialWidth<T>(column: TableColumn<T>) {
  return clampTableColumnWidth(column, column.width ?? DEFAULT_TABLE_COLUMN_WIDTH)
}

/**
 * Normalizes a requested column order so it contains every column exactly once.
 *
 * @template T - Row shape rendered by the table.
 * @param columns - Available columns.
 * @param columnOrder - Requested order.
 * @returns A stable, complete order using the current columns.
 */
export function normalizeTableColumnOrder<T>(columns: TableColumn<T>[], columnOrder?: string[]) {
  const columnIds = columns.map((column) => column.id)
  const requestedIds = Array.from(new Set(columnOrder ?? [])).filter((columnId) =>
    columnIds.includes(columnId),
  )
  const remainingIds = columnIds.filter((columnId) => !requestedIds.includes(columnId))

  return [...requestedIds, ...remainingIds]
}

/**
 * Reorders table columns to match a requested column order.
 *
 * @template T - Row shape rendered by the table.
 * @param columns - Available columns.
 * @param columnOrder - Requested order.
 * @returns Columns in the requested order with unknown ids removed.
 */
export function reorderTableColumns<T>(columns: TableColumn<T>[], columnOrder: string[]) {
  const columnById = new Map(columns.map((column) => [column.id, column] as const))

  return columnOrder.map((columnId) => columnById.get(columnId)).filter(Boolean) as TableColumn<T>[]
}

/**
 * Moves one column id to a new position in the order list.
 *
 * @param columnOrder - Current order.
 * @param sourceColumnId - Dragged column id.
 * @param targetColumnId - Drop target column id.
 * @param placement - Whether the dragged column should land before or after the target.
 * @returns The updated column order.
 */
export function moveTableColumn(
  columnOrder: string[],
  sourceColumnId: string,
  targetColumnId: string,
  placement: TableColumnReorderPlacement,
) {
  if (sourceColumnId === targetColumnId) {
    return columnOrder
  }

  const normalizedOrder = Array.from(new Set(columnOrder))
  const sourceIndex = normalizedOrder.indexOf(sourceColumnId)
  const targetIndex = normalizedOrder.indexOf(targetColumnId)

  if (sourceIndex < 0 || targetIndex < 0) {
    return normalizedOrder
  }

  const orderWithoutSource = normalizedOrder.filter((columnId) => columnId !== sourceColumnId)
  const adjustedTargetIndex = orderWithoutSource.indexOf(targetColumnId)

  if (adjustedTargetIndex < 0) {
    return normalizedOrder
  }

  const insertIndex = placement === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex

  return [
    ...orderWithoutSource.slice(0, insertIndex),
    sourceColumnId,
    ...orderWithoutSource.slice(insertIndex),
  ]
}

/**
 * Builds the initial width map for resizable table columns.
 *
 * @template T - Row shape rendered by the table.
 * @param columns - Available columns.
 * @param existingColumnWidths - Previously stored widths that should be preserved.
 * @returns A width map keyed by column id.
 */
export function createTableColumnWidths<T>(
  columns: TableColumn<T>[],
  existingColumnWidths?: Record<string, number>,
) {
  return columns.reduce<Record<string, number>>((accumulator, column) => {
    const existingWidth = existingColumnWidths?.[column.id]

    accumulator[column.id] = clampTableColumnWidth(
      column,
      existingWidth ?? getTableColumnInitialWidth(column),
    )

    return accumulator
  }, {})
}

/**
 * Calculates the visible portion of a virtualized table body.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Virtualization inputs.
 * @param params.rows - Full row list.
 * @param params.scrollTop - Current scroll offset.
 * @param params.rowHeight - Fixed row height in pixels.
 * @param params.overscan - Number of extra rows rendered above and below the viewport.
 * @param params.viewportHeight - Height of the scroll container in pixels.
 * @returns The visible rows and spacer heights required for virtualization.
 */
export function getVirtualizedTableWindow<T>({
  rows,
  scrollTop,
  rowHeight,
  overscan,
  viewportHeight,
}: VirtualizedTableWindowParams<T>): VirtualizedTableWindowResult<T> {
  const totalRowCount = rows.length

  if (totalRowCount === 0) {
    return {
      visibleRows: rows,
      virtualStartIndex: 0,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
    }
  }

  const safeRowHeight = Math.max(1, rowHeight)
  const safeOverscan = Math.max(0, overscan)
  const startIndex = Math.max(0, Math.floor(scrollTop / safeRowHeight) - safeOverscan)
  const visibleCount = Math.max(1, Math.ceil(viewportHeight / safeRowHeight) + safeOverscan * 2)
  const endIndex = Math.min(totalRowCount, startIndex + visibleCount)
  const visibleRows = rows.slice(startIndex, endIndex)
  const topSpacerHeight = startIndex * safeRowHeight
  const bottomSpacerHeight = Math.max(
    0,
    (totalRowCount - startIndex - visibleRows.length) * safeRowHeight,
  )

  return {
    visibleRows,
    virtualStartIndex: startIndex,
    topSpacerHeight,
    bottomSpacerHeight,
  }
}
