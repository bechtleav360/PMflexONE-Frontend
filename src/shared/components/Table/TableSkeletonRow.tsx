import { cn } from '@/shared/lib/utils'

interface TableSkeletonColumn {
  id: string
  cellClassName?: string
  truncate?: boolean
}

interface TableSkeletonRowProps {
  columns: TableSkeletonColumn[]
  selection?: {
    isSelectionEnabled: boolean
  }
  rowClassName?: string
  cellClassName?: string
}

/**
 * Renders a single skeleton row for the shared table.
 *
 * @param props - Component props.
 * @param props.selection - Selection state used to render the placeholder column.
 * @param props.columns - Column definitions used to size the placeholders.
 * @param props.rowClassName - Optional additional classes for the row.
 * @param props.cellClassName - Optional additional classes for the cells.
 * @returns A table row with animated skeleton cells.
 */
export function TableSkeletonRow({
  columns,
  selection,
  rowClassName,
  cellClassName,
}: TableSkeletonRowProps) {
  return (
    <tr className={cn('group', rowClassName)}>
      {selection?.isSelectionEnabled ? (
        <td className="border-border px-lg w-12 border-b text-center align-middle">
          <div className="bg-primary/10 mx-auto h-4 w-4 rounded-sm motion-safe:animate-pulse motion-reduce:animate-none" />
        </td>
      ) : null}
      {columns.map((column, index) => (
        <td
          key={column.id}
          className={cn(
            'border-border p-lg border-b align-middle',
            column.truncate && 'max-w-0 overflow-hidden',
            cellClassName,
            column.cellClassName,
          )}
        >
          <div
            className={cn(
              'bg-primary/10 rounded-md motion-safe:animate-pulse motion-reduce:animate-none',
              index === 0 ? 'h-4 w-3/4' : 'h-4 w-full',
            )}
          />
        </td>
      ))}
    </tr>
  )
}
