import { TableContent } from './TableContent'
import type { TableProps } from './TableTypes'

/**
 * Shared table component with sorting, pagination, and optional virtualization.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Component props.
 * @returns The rendered table.
 */
export function Table<T>(props: TableProps<T>) {
  return <TableContent {...props} />
}

export type {
  TableColumn,
  TableColumnOrderPersistenceAdapter,
  TableColumnOrderPersistenceConfig,
  TableColumnReorderPlacement,
  TablePaginationState,
  TableProps,
  TableSelectionMode,
  TableSelectionState,
  TableSortDirection,
  TableSortState,
  TableVirtualizationState,
} from './TableTypes'
