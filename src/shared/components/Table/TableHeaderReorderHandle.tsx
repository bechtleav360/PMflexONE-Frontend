import type { ReactNode } from 'react'

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'

import { cn } from '@/shared/lib/utils'

import { GripDotsIcon } from './GripDotsIcon'

interface TableHeaderColumn {
  id: string
  header: ReactNode
  reorderable?: boolean
}

interface TableHeaderReorderHandleProps {
  column: TableHeaderColumn
  canReorderColumn: boolean
  isDragging: boolean
  dragHandleAttributes: DraggableAttributes
  dragHandleListeners?: DraggableSyntheticListeners
  setDragHandleNodeRef: (node: HTMLElement | null) => void
  t: (key: string, options?: { label: string }) => string
}

function getTableHeaderColumnLabel(column: TableHeaderColumn) {
  return typeof column.header === 'string' || typeof column.header === 'number'
    ? String(column.header)
    : column.id
}

/**
 * Drag handle button rendered inside a sortable header cell.
 * Returns null when the column does not support reordering.
 * @param props - Reorder handle inputs.
 * @returns The drag handle button, or null.
 */
export function TableHeaderReorderHandle(props: TableHeaderReorderHandleProps) {
  const {
    column,
    canReorderColumn,
    isDragging,
    dragHandleAttributes,
    dragHandleListeners,
    setDragHandleNodeRef,
    t,
  } = props
  if (!canReorderColumn) {
    return null
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-sm p-0.5',
        'text-muted-foreground transition-[opacity,color] duration-150',
        'opacity-0 group-hover:opacity-100',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        isDragging
          ? 'text-foreground cursor-grabbing opacity-100'
          : 'hover:text-foreground cursor-grab',
      )}
      ref={setDragHandleNodeRef}
      {...dragHandleAttributes}
      {...dragHandleListeners}
      aria-label={t('shared.table.reorderColumn', { label: getTableHeaderColumnLabel(column) })}
    >
      <GripDotsIcon />
    </button>
  )
}
