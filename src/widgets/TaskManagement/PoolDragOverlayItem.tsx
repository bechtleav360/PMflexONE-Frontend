interface PoolDragOverlayItemProps {
  name: string
}

/**
 * Ghost list item rendered inside the DnD drag overlay while a pool row is being dragged.
 * @param root0 - Component props.
 * @param root0.name - The work item name to display in the ghost card.
 * @returns The drag overlay ghost element.
 */
export function PoolDragOverlayItem({ name }: PoolDragOverlayItemProps) {
  return (
    <li className="bg-card flex list-none items-center justify-between rounded-md border px-4 py-2 opacity-90 shadow-lg">
      <span className="text-muted-foreground mr-1 shrink-0">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line
            x1="9"
            y1="5"
            x2="9"
            y2="19"
          />
          <line
            x1="15"
            y1="5"
            x2="15"
            y2="19"
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="truncate text-sm font-medium">{name}</span>
      </span>
    </li>
  )
}
