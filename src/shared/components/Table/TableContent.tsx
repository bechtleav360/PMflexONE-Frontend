import { TableContentView } from './TableContentView'
import type { TableProps } from './TableTypes'
import { useTableContentState } from './useTableContentState'

/**
 * Renders the shared table content with ordering, resizing, virtualization, and pagination.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Table props.
 * @returns The rendered table layout.
 */
export function TableContent<T>(props: TableProps<T>) {
  const tableState = useTableContentState(props)

  return <TableContentView<T> {...tableState} />
}
