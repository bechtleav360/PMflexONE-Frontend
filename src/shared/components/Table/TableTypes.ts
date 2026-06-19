import type { HTMLAttributes, Key, ReactNode } from 'react'

/**
 * Horizontal alignment options for table cells.
 */
export type TableAlignment = 'left' | 'center' | 'right'

/**
 * Placement of a dragged column relative to the drop target.
 */
export type TableColumnReorderPlacement = 'before' | 'after'

/**
 * Direction used when sorting a table column.
 */
export type TableSortDirection = 'asc' | 'desc'

/**
 * Selection mode used by the shared table.
 */
export type TableSelectionMode = 'none' | 'single' | 'multiple'

/**
 * Active sort state for the shared table.
 *
 * @property field - The active column sort key.
 * @property direction - The active sort direction.
 */
export interface TableSortState {
  field: string
  direction: TableSortDirection
}

/**
 * Column definition for the shared table.
 *
 * @template T - Row shape rendered by the table.
 */
export interface TableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortable?: boolean
  sortKey?: string
  sortLabel?: string
  reorderable?: boolean
  resizable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  headerClassName?: string
  cellClassName?: string
  align?: TableAlignment
  /** Truncate overflowing cell text with an ellipsis. Uses max-w-0 so the column
   *  shrinks to its table-allocated width rather than expanding to fit content. */
  truncate?: boolean
}

/**
 * Persistence adapter for shared table column order state.
 */
export interface TableColumnOrderPersistenceAdapter {
  load: (key: string) => string[] | null
  save: (key: string, columnOrder: string[]) => void
}

/**
 * Persistence configuration for shared table column order state.
 */
export interface TableColumnOrderPersistenceConfig {
  key: string
  adapter?: TableColumnOrderPersistenceAdapter
}

/**
 * Pagination state for the shared table.
 */
export interface TablePaginationState {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

/**
 * Derived pagination range for the shared table footer.
 */
export interface TablePaginationRange {
  from: number
  to: number
  totalPages: number
}

/**
 * Controlled row selection state for the shared table.
 *
 * @template T - Row shape rendered by the table.
 */
export interface TableSelectionState<T> {
  mode: TableSelectionMode
  selectedRowKeys?: Key[]
  onSelectedRowKeysChange?: (selectedRowKeys: Key[]) => void
  isRowSelectable?: (row: T, index: number) => boolean
  getRowSelectionLabel?: (row: T, index: number) => string
}

/**
 * Virtualization state for the shared table.
 */
export interface TableVirtualizationState {
  enabled?: boolean
  height: number
  rowHeight?: number
  overscan?: number
}

/**
 * Props for the shared table component.
 *
 * @template T - Row shape rendered by the table.
 */
export interface TableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => Key
  sort?: TableSortState | null
  onSortChange?: (sort: TableSortState | null) => void
  selection?: TableSelectionState<T>
  enableColumnReordering?: boolean
  enableColumnResizing?: boolean
  columnOrder?: string[]
  defaultColumnOrder?: string[]
  onColumnOrderChange?: (columnOrder: string[]) => void
  columnOrderPersistence?: TableColumnOrderPersistenceConfig
  pagination?: TablePaginationState
  virtualization?: TableVirtualizationState
  stickyHeader?: boolean
  stickyHeaderOffset?: number
  loading?: boolean
  loadingRowsCount?: number
  emptyTitle?: string
  emptyDescription?: string
  containerClassName?: string
  tableClassName?: string
  headerRowClassName?: string
  rowClassName?: string
  cellClassName?: string
}
