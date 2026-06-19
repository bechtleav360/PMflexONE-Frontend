import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BoardColumn } from '@/entities/work-item'
import {
  Button,
  PopoverContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import { SuggestionButton } from './SuggestionButton'

interface QuickMoveContentProps {
  suggestedColumns: BoardColumn[]
  currentColumnId: string | undefined
  currentColumnPosition: number
  sortedCols: BoardColumn[]
  effectiveColumnId: string
  onColumnChange: (id: string) => void
  onMove: (columnId: string) => void
  onMoveToPool: () => void
  isPending: boolean
}

/**
 * Popover body for the quick-move action: suggested column buttons, a pool button, and a full column select.
 * @param root0 - Component props.
 * @param root0.suggestedColumns - First 3 columns to show as quick suggestions.
 * @param root0.currentColumnId - ID of the card's current column (used for arrow direction).
 * @param root0.currentColumnPosition - Position of the current column (used for arrow direction).
 * @param root0.sortedCols - All non-current columns for the select dropdown.
 * @param root0.effectiveColumnId - Currently selected column in the select.
 * @param root0.onColumnChange - Called when the select value changes.
 * @param root0.onMove - Called with a column ID to execute the move.
 * @param root0.onMoveToPool - Called to move the card back to the active task pool.
 * @param root0.isPending - Whether a move mutation is in flight.
 * @returns The popover content element.
 */
export function QuickMoveContent({
  suggestedColumns,
  currentColumnId,
  currentColumnPosition,
  sortedCols,
  effectiveColumnId,
  onColumnChange,
  onMove,
  onMoveToPool,
  isPending,
}: QuickMoveContentProps) {
  const { t } = useTranslation()
  return (
    <PopoverContent
      className="w-64 p-3"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="mb-3 text-sm font-semibold">{t('features.workItem.board.quickMoveTitle')}</p>
      <div className="mb-3">
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
          {t('features.workItem.board.quickMoveSuggested')}
        </p>
        {suggestedColumns.map((col) => (
          <SuggestionButton
            key={col.id}
            column={col}
            isForward={!!currentColumnId && col.position > currentColumnPosition}
            onClick={onMove}
          />
        ))}
        {currentColumnId && (
          <button
            type="button"
            onClick={onMoveToPool}
            disabled={isPending}
            className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
          >
            <ArrowRight className="text-muted-foreground h-3 w-3 shrink-0" />
            <span className="truncate">{t('pages.taskManagement.activePool', 'Active Tasks')}</span>
          </button>
        )}
      </div>
      <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
        {t('features.workItem.board.quickMoveColumnLabel')}
      </p>
      <Select
        value={effectiveColumnId}
        onValueChange={onColumnChange}
      >
        <SelectTrigger className="mb-3 w-full">
          <SelectValue placeholder={t('features.workItem.board.quickMoveColumnPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {sortedCols.map((col) => (
            <SelectItem
              key={col.id}
              value={col.id}
            >
              {col.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={() => onMove(effectiveColumnId)}
        disabled={!effectiveColumnId || isPending}
        className="w-full"
        size="sm"
      >
        {t('features.workItem.board.quickMoveAction')}
      </Button>
    </PopoverContent>
  )
}
