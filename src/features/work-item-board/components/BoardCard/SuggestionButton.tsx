import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { BoardColumn } from '@/entities/work-item'

interface SuggestionButtonProps {
  column: BoardColumn
  isForward: boolean
  onClick: (id: string) => void
}

/**
 * A single quick-move suggestion button showing a column name with a directional arrow.
 * @param root0 - Component props.
 * @param root0.column - Target column.
 * @param root0.isForward - Whether to show a right arrow (forward) or left arrow (backward).
 * @param root0.onClick - Called with the column ID when clicked.
 * @returns The suggestion button element.
 */
export function SuggestionButton({ column, isForward, onClick }: SuggestionButtonProps) {
  const Icon = isForward ? ArrowRight : ArrowLeft
  return (
    <button
      type="button"
      onClick={() => onClick(column.id)}
      className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      <Icon className="text-muted-foreground h-3 w-3 shrink-0" />
      <span className="truncate">{column.name}</span>
    </button>
  )
}
