interface TableEmptyStateProps {
  columns: number
  title: string
  description: string
}

/**
 * Renders the empty-state row for the shared table.
 *
 * @param props - Component props.
 * @returns A single full-width table row.
 */
export function TableEmptyState(props: TableEmptyStateProps) {
  const { columns, title, description } = props

  return (
    <tr>
      <td
        className="p-10 text-center"
        colSpan={columns}
      >
        <div className="text-muted-foreground gap-sm flex flex-col items-center">
          <p className="text-foreground text-base font-medium">{title}</p>
          <p className="text-sm">{description}</p>
        </div>
      </td>
    </tr>
  )
}
