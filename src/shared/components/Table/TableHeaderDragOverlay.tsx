import type { ReactNode } from 'react'

import { GripDotsIcon } from './GripDotsIcon'

interface TableHeaderDragOverlayProps {
  header: ReactNode
}

/**
 * Floating preview shown under the pointer during a column-reorder drag.
 * @param props - Component props.
 * @param props.header - The column header content to display inside the overlay.
 * @returns The drag overlay element.
 */
export function TableHeaderDragOverlay({ header }: TableHeaderDragOverlayProps) {
  return (
    <div className="gap-sm border-border bg-card px-lg text-muted-foreground flex h-12 cursor-grabbing items-center rounded-sm border text-[11px] font-bold tracking-[0.05em] uppercase shadow-md select-none">
      <GripDotsIcon className="shrink-0" />
      <span>{header}</span>
    </div>
  )
}
