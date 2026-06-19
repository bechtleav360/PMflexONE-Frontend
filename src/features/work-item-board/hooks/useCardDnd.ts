import { useState } from 'react'

import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import { type Board, type ProjectWorkItem } from '@/entities/work-item'

import { useMoveWorkItemInColumn } from './useMoveWorkItemInColumn'

type MoveInColumnFn = ReturnType<typeof useMoveWorkItemInColumn>['mutateAsync']

async function reorderInColumn(
  moveInColumn: MoveInColumnFn,
  workItemId: string,
  overId: string,
  targetColumn: Board['columns'][number],
  workItem: ProjectWorkItem,
) {
  const items = (targetColumn.workItems ?? []).filter((wi) => !wi.archived)
  const oldIdx = items.findIndex((wi) => wi.id === workItemId)
  const overItemIdx = items.findIndex((wi) => wi.id === overId)
  const newIdx = overItemIdx === -1 ? items.length - 1 : overItemIdx
  if (oldIdx === newIdx) return
  // Compute afterWorkItemId: item immediately before the new position after reorder
  const reordered = arrayMove(items, oldIdx, newIdx)
  const afterWorkItemId = newIdx > 0 ? (reordered[newIdx - 1]?.id ?? null) : null
  try {
    await moveInColumn({
      workItemId,
      version: workItem.version,
      boardColumnId: targetColumn.id,
      afterWorkItemId,
    })
  } catch {
    /* rollback handled in hook onError */
  }
}

/**
 * Manages drag-and-drop state for board cards, including cross-column moves and same-column reordering.
 * Uses the unified moveWorkItem API with afterWorkItemId-based positioning.
 * @param board - The board whose columns and work items are being managed.
 * @param allWorkItems - Flat list of all work items across all columns.
 * @returns Sensors, active drag state, drag event handlers, and a clearDrag function.
 */
export function useCardDnd(board: Board, allWorkItems: ProjectWorkItem[]) {
  const { mutateAsync: moveInColumn } = useMoveWorkItemInColumn(board.id)
  const [activeWorkItem, setActiveWorkItem] = useState<ProjectWorkItem | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function findColumnForId(id: string) {
    return (
      board.columns.find((c) => c.id === id) ??
      board.columns.find((c) => c.workItems?.some((wi) => wi.id === id))
    )
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveWorkItem(allWorkItems.find((wi) => wi.id === String(event.active.id)) ?? null)
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over ? String(event.over.id) : null
    setDragOverId(overId !== String(event.active.id) ? overId : null)
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveWorkItem(null)
    setDragOverId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const workItemId = String(active.id)
    const overId = String(over.id)
    const sourceColumn = findColumnForId(workItemId)
    const targetColumn = findColumnForId(overId)
    if (!targetColumn) return

    const workItem = allWorkItems.find((wi) => wi.id === workItemId)
    if (!workItem) return

    if (sourceColumn?.id === targetColumn.id) {
      await reorderInColumn(moveInColumn, workItemId, overId, targetColumn, workItem)
      return
    }

    // Cross-column move — always place at the TOP of the target column (afterWorkItemId = null)
    try {
      await moveInColumn({
        workItemId,
        version: workItem.version,
        boardColumnId: targetColumn.id,
        afterWorkItemId: null,
      })
    } catch {
      /* rollback handled in hook onError */
    }
  }

  function clearDrag() {
    setActiveWorkItem(null)
    setDragOverId(null)
  }

  return {
    activeWorkItem,
    dragOverId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    clearDrag,
  }
}
