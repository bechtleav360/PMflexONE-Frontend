import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Board, BoardColumn, ProjectWorkItem } from '@/entities/work-item'
import { BOARD_QUERY_KEY, useBoard, WORK_ITEMS_QUERY_KEY } from '@/entities/work-item'
import {
  Popover,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { useMoveWorkItemInColumn } from '../../hooks/useMoveWorkItemInColumn'
import { QuickMoveContent } from './QuickMoveContent'

// ── helpers ──────────────────────────────────────────────────────────────────

function sortByPosition(cols: BoardColumn[]): BoardColumn[] {
  return [...cols].sort((a, b) => a.position - b.position)
}

function defaultColumnId(cols: BoardColumn[], selected: string): string {
  return selected || cols[0]?.id || ''
}

/**
 * Returns the first 3 columns of the board sorted by position, excluding the card's current column.
 * @param board - The board whose columns to inspect.
 * @param currentColumnId - ID of the column the card currently belongs to (excluded from results).
 * @returns Up to 3 suggested target columns.
 */
function getSuggestedColumns(
  board: Board | null | undefined,
  currentColumnId: string | undefined,
): BoardColumn[] {
  if (!board) return []
  return sortByPosition(board.columns)
    .filter((c) => c.id !== currentColumnId)
    .slice(0, 3)
}

// ── custom hook ───────────────────────────────────────────────────────────────

function resolveCurrentColumn(
  board: Board | undefined,
  workItemId: string,
  fallback: ProjectWorkItem['boardColumn'],
) {
  const found = board?.columns.find((col) => col.workItems?.some((wi) => wi.id === workItemId))
  return {
    id: found?.id ?? fallback?.id,
    position: found?.position ?? fallback?.position ?? 0,
  }
}

function useQuickMoveState(workItem: ProjectWorkItem, currentBoardId: string) {
  const [selectedColumnId, setSelectedColumnId] = useState('')
  const scopeId = workItem.scope?.id ?? ''
  // Use the already-loaded board from cache instead of fetching all boards
  const { data: currentBoard } = useBoard(currentBoardId)

  const { id: currentColumnId, position: currentColumnPosition } = resolveCurrentColumn(
    currentBoard ?? undefined,
    workItem.id,
    workItem.boardColumn,
  )

  const suggestedColumns = getSuggestedColumns(currentBoard, currentColumnId)
  const sortedCols = sortByPosition(currentBoard?.columns ?? []).filter(
    (c) => c.id !== currentColumnId,
  )
  const effectiveColumnId = defaultColumnId(sortedCols, selectedColumnId)

  return {
    scopeId,
    currentColumnId,
    currentColumnPosition,
    suggestedColumns,
    sortedCols,
    effectiveColumnId,
    setSelectedColumnId,
  }
}

// ── main component ────────────────────────────────────────────────────────────

interface QuickMovePopoverProps {
  workItem: ProjectWorkItem
  currentBoardId: string
  direction?: 'left' | 'right'
  scopeType?: ScopeType
}

/**
 * Inline "quick move" popover — shows the first 3 board columns as suggestions
 * (direct click = immediate move) plus a full column select with a Move button.
 * @param root0 - Component props.
 * @param root0.workItem - The work item to move.
 * @param root0.currentBoardId - The board the card currently lives on (for cache invalidation).
 * @param root0.direction - Arrow direction on the trigger button ('left' or 'right', default 'right').
 * @param root0.scopeType - The scope entity type used to invalidate the correct query key.
 * @returns A Popover-wrapped icon button rendered inside the board card.
 */
export function QuickMovePopover({
  workItem,
  currentBoardId,
  direction = 'right',
  scopeType = 'Project' as ScopeType,
}: QuickMovePopoverProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const TriggerIcon = direction === 'left' ? ArrowLeft : ArrowRight

  const {
    scopeId,
    currentColumnId,
    currentColumnPosition,
    suggestedColumns,
    sortedCols,
    effectiveColumnId,
    setSelectedColumnId,
  } = useQuickMoveState(workItem, currentBoardId)

  const { mutate: move, isPending } = useMoveWorkItemInColumn(currentBoardId, scopeType, scopeId)

  function performMove(columnId: string) {
    move(
      {
        workItemId: workItem.id,
        version: workItem.version,
        boardColumnId: columnId,
        afterWorkItemId: null,
      },
      {
        onSuccess: async () => {
          if (currentBoardId)
            await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(currentBoardId) })
          setOpen(false)
        },
      },
    )
  }

  function performMoveToPool() {
    move(
      {
        workItemId: workItem.id,
        version: workItem.version,
        boardColumnId: null,
        afterWorkItemId: null,
      },
      {
        onSuccess: async () => {
          if (currentBoardId)
            await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(currentBoardId) })
          if (scopeId)
            await queryClient.invalidateQueries({
              queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId),
            })
          setOpen(false)
        },
      },
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={t('features.workItem.board.quickMove')}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded p-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
            >
              <TriggerIcon className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('features.workItem.board.quickMove')}</TooltipContent>
      </Tooltip>

      <QuickMoveContent
        suggestedColumns={suggestedColumns}
        currentColumnId={currentColumnId}
        currentColumnPosition={currentColumnPosition}
        sortedCols={sortedCols}
        effectiveColumnId={effectiveColumnId}
        onColumnChange={setSelectedColumnId}
        onMove={performMove}
        onMoveToPool={performMoveToPool}
        isPending={isPending}
      />
    </Popover>
  )
}
