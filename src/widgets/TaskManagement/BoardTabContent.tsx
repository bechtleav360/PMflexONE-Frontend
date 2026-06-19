import { useBoard } from '@/entities/work-item'
import { Board, useBoardFilterStore } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

import { PriorityFilterBar } from './PriorityFilterBar'

interface BoardTabContentProps {
  boardId: string
  scopeType: ScopeType
  onSelect?: (workItemId: string) => void
  onAddTask?: (columnId: string) => void
}

/**
 * Renders the Board component for a single board tab, fetching the board by id.
 * Includes a multi-select priority filter bar above the columns (same badge style as the pool).
 * @param root0 - Component props.
 * @param root0.boardId - The board ID to fetch and render.
 * @param root0.scopeType - The scope entity type — forwarded to the Board for mutation context.
 * @param root0.onSelect - Called when the user clicks a card to open the detail panel.
 * @param root0.onAddTask - Called with the column ID when the user clicks "Add a task".
 * @returns The board component or null if not yet loaded.
 */
export function BoardTabContent({ boardId, scopeType, onSelect, onAddTask }: BoardTabContentProps) {
  const { data: board } = useBoard(boardId)
  const { priorities, setPriorities } = useBoardFilterStore()

  if (!board) return null

  const allWorkItems = board.columns.flatMap((c) => c.workItems ?? [])

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-1 pt-1 pb-2">
        <PriorityFilterBar
          items={allWorkItems}
          activeFilters={priorities}
          onFilterChange={setPriorities}
        />
      </div>
      <Board
        board={board}
        scopeType={scopeType}
        onSelect={onSelect}
        onAddTask={onAddTask}
      />
    </div>
  )
}
