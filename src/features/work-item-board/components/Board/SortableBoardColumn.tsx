import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { BoardColumn } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { BoardColumn as BoardColumnComponent } from '../BoardColumn'
import { applyFilter } from './boardUtils'

/** Props for the SortableBoardColumn component. */
export interface SortableBoardColumnProps {
  column: BoardColumn
  boardId: string
  filter: { priorities?: ReadonlySet<string>; labelId?: string | null; assigneeId?: string | null }
  dragOverId: string | null
  activeDragColumnId: string | null
  onSelect?: (workItemId: string) => void
  onNativeDrop?: (workItemId: string, version: number, columnId: string) => void
  onAddTask?: (columnId: string) => void
  scopeType?: ScopeType
}

/**
 * Wraps a board column with dnd-kit sortable behaviour for column reordering.
 * @param root0 - Component props.
 * @param root0.column - The board column data to render.
 * @param root0.boardId - ID of the parent board.
 * @param root0.filter - Active priority/label filter.
 * @param root0.dragOverId - ID of the item currently being dragged over.
 * @param root0.activeDragColumnId - ID of the column currently being dragged.
 * @param root0.onSelect - Called when the user clicks a card.
 * @param root0.onNativeDrop - Called when a work item is dropped via native HTML5 drag.
 * @param root0.onAddTask - Called with the column ID when the user clicks "Add a task".
 * @param root0.scopeType - The scope entity type, forwarded to the board column.
 * @returns A sortable wrapper around the column element.
 */
export function SortableBoardColumn({
  column,
  boardId,
  filter,
  dragOverId,
  activeDragColumnId,
  onSelect,
  onNativeDrop,
  onAddTask,
  scopeType,
}: SortableBoardColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({
    id: column.id,
    data: { type: 'column' },
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const filtered = applyFilter(column.workItems ?? [], filter)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex shrink-0"
    >
      <BoardColumnComponent
        column={{ ...column, workItems: filtered }}
        boardId={boardId}
        dragOverId={dragOverId}
        isCardDragOver={isOver}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={activeDragColumnId === column.id}
        onNativeDrop={onNativeDrop}
        onAddTask={onAddTask ? () => onAddTask(column.id) : undefined}
        scopeType={scopeType}
      />
    </div>
  )
}
