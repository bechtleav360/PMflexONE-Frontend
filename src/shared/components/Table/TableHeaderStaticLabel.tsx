import { cn } from '@/shared/lib/utils'

import type { TableColumn } from './TableTypes'

interface TableHeaderStaticLabelProps<T> {
  column: TableColumn<T>
}

/**
 * Renders the static column label used for non-sortable table headers.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Static label inputs.
 * @returns The label content.
 */
export function TableHeaderStaticLabel<T>(props: TableHeaderStaticLabelProps<T>) {
  const { column } = props
  return (
    <span className={cn('gap-sm inline-flex items-center')}>
      <span>{column.header}</span>
    </span>
  )
}
