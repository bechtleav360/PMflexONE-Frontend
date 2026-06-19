import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import type { TableColumn, TableSortDirection, TableSortState } from './TableTypes'
import { getTableJustifyClassName } from './tableUtils'

interface TableHeaderSortButtonProps<T> {
  column: TableColumn<T>
  sortDirection: TableSortDirection | null
  sortLabel: string
  onSortChange?: (sort: TableSortState | null) => void
  nextSortState: TableSortState | null
  isDragging?: boolean
}

function getSortIcon(sortDirection: TableSortDirection | null, isSorted: boolean) {
  if (!isSorted) {
    return <ArrowUpDown className="text-muted-foreground h-4 w-4" />
  }

  if (sortDirection === 'asc') {
    return <ArrowUp className="h-4 w-4" />
  }

  return <ArrowDown className="h-4 w-4" />
}

/**
 * Renders the sort toggle button for a table header cell.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Sort button inputs.
 * @returns The sort button or null.
 */
export function TableHeaderSortButton<T>(props: TableHeaderSortButtonProps<T>) {
  const {
    column,
    sortDirection,
    sortLabel,
    onSortChange,
    nextSortState,
    isDragging = false,
  } = props
  if (!column.sortable) {
    return null
  }

  return (
    <button
      type="button"
      className={cn(
        isDragging
          ? 'gap-sm inline-flex items-center rounded-sm text-inherit transition-colors focus-visible:outline-none'
          : 'hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background gap-sm inline-flex items-center rounded-sm text-inherit transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        getTableJustifyClassName(column.align),
      )}
      onClick={() => {
        if (nextSortState) {
          onSortChange?.(nextSortState)
        }
      }}
      aria-label={sortLabel}
    >
      <span>{column.header}</span>
      {getSortIcon(sortDirection, sortDirection !== null)}
    </button>
  )
}
