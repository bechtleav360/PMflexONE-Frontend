import { useCallback, useState } from 'react'

import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import type { BoardColumn, Board as BoardType, ProjectWorkItem } from '@/entities/work-item'

import { useCardDnd } from '../../hooks/useCardDnd'

interface UseBoardDragHandlersArgs {
  board: BoardType
  sortedColumns: BoardColumn[]
  allWorkItems: ProjectWorkItem[]
  assignFromPool: (args: {
    workItemId: string
    boardColumnId: string
    version: number
  }) => Promise<unknown>
  reorderColumns: (ids: string[]) => void
}

/**
 * Returns a reordered column ID array after a drag, or null if the move is invalid.
 * @param sortedColumns - The current sorted list of board columns.
 * @param activeId - The ID of the column being dragged.
 * @param overId - The ID of the column being dragged over.
 * @returns The new column ID order, or null if the columns are incompatible.
 */
function reorderColumnIds(
  sortedColumns: BoardColumn[],
  activeId: string,
  overId: string,
): string[] | null {
  const activeColumn = sortedColumns.find((c) => c.id === activeId)
  const overColumn = sortedColumns.find((c) => c.id === overId)
  if (!activeColumn || !overColumn || activeColumn.workItemStatus !== overColumn.workItemStatus)
    return null
  const oldIndex = sortedColumns.findIndex((c) => c.id === activeId)
  const newIndex = sortedColumns.findIndex((c) => c.id === overId)
  if (oldIndex === -1 || newIndex === -1) return null
  return arrayMove(sortedColumns, oldIndex, newIndex).map((c) => c.id)
}

/**
 * Encapsulates all drag-and-drop state and handlers for the Board component.
 * @param args - Board entity, sorted columns, work items, and mutation callbacks.
 * @param args.board - The board being rendered.
 * @param args.sortedColumns - Position-sorted columns used for column reorder logic.
 * @param args.allWorkItems - All work items across columns, used by the card DnD hook.
 * @param args.assignFromPool - Mutation to assign a work item to a column via native drop.
 * @param args.reorderColumns - Mutation to persist a new column order.
 * @returns Drag state, collision detection, and unified drag event handlers.
 */
export function useBoardDragHandlers({
  board,
  sortedColumns,
  allWorkItems,
  assignFromPool,
  reorderColumns,
}: UseBoardDragHandlersArgs) {
  const [activeDragColumnId, setActiveDragColumnId] = useState<string | null>(null)

  const {
    activeWorkItem,
    dragOverId,
    sensors,
    handleDragStart: handleCardDragStart,
    handleDragOver: handleCardDragOver,
    handleDragEnd: handleCardDragEnd,
    clearDrag,
  } = useCardDnd(board, allWorkItems)

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerCollisions = pointerWithin(args)
    return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args)
  }, [])

  async function handleNativeDrop(workItemId: string, version: number, boardColumnId: string) {
    try {
      await assignFromPool({ workItemId, boardColumnId, version })
    } catch {
      /* toast handled in hook */
    }
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'column') setActiveDragColumnId(String(event.active.id))
    else handleCardDragStart(event)
  }

  function handleDragOver(event: DragOverEvent) {
    if (event.active.data.current?.type !== 'column') handleCardDragOver(event)
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.active.data.current?.type === 'column') {
      setActiveDragColumnId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return
      const newIds = reorderColumnIds(sortedColumns, String(active.id), String(over.id))
      if (newIds) reorderColumns(newIds)
    } else {
      void handleCardDragEnd(event)
    }
  }

  return {
    activeDragColumnId,
    collisionDetection,
    handleNativeDrop,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeWorkItem,
    dragOverId,
    sensors,
    clearDrag,
  }
}
