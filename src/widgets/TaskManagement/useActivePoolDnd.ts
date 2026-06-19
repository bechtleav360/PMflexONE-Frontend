import { useEffect, useRef, useState } from 'react'

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import type { ProjectWorkItem } from '@/entities/work-item'
import { useAssignWorkItemToColumn, useMoveWorkItemInPool } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

import { useActivePoolNativeDrag } from './useActivePoolNativeDrag'

interface UseActivePoolDndOptions {
  scopeType: ScopeType
  scopeId: string
  currentBoardId: string
  visibleItems: ProjectWorkItem[]
  setOrderedIds: (ids: string[]) => void
}

interface UseActivePoolDndResult {
  sensors: ReturnType<typeof useSensors>
  activePoolItem: ProjectWorkItem | null
  isBoardCardDragOver: boolean
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => Promise<void>
  handleDragCancel: () => void
  handleNativeDragOver: (e: React.DragEvent) => void
  handleNativeDragLeave: (e: React.DragEvent) => void
  handleNativeDrop: (e: React.DragEvent) => void
}

/**
 * Encapsulates dnd-kit sensor setup and drag-start/end handlers for the ActivePool widget.
 * Native HTML5 drag-over / drop logic is delegated to {@link useActivePoolNativeDrag}.
 * @param options - Configuration options for the hook.
 * @returns Drag sensors, active item state, and event handlers for the pool's DnD interactions.
 */
export function useActivePoolDnd({
  scopeType,
  scopeId,
  currentBoardId,
  visibleItems,
  setOrderedIds,
}: UseActivePoolDndOptions): UseActivePoolDndResult {
  const [activePoolItem, setActivePoolItem] = useState<ProjectWorkItem | null>(null)

  // Keep a stable ref so the mutation onSettled closure always calls the latest setter.
  const setOrderedIdsRef = useRef(setOrderedIds)
  useEffect(() => {
    setOrderedIdsRef.current = setOrderedIds
  }, [setOrderedIds])

  const { mutate: moveInPool } = useMoveWorkItemInPool(scopeType, scopeId, {
    onSettled: () => setOrderedIdsRef.current([]),
  })
  const { mutateAsync: assignToColumn } = useAssignWorkItemToColumn(
    currentBoardId,
    scopeType,
    scopeId,
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const nativeDrag = useActivePoolNativeDrag({ scopeType, scopeId, currentBoardId, visibleItems })

  function handleDragStart(event: DragStartEvent) {
    setActivePoolItem(visibleItems.find((wi) => wi.id === String(event.active.id)) ?? null)
  }

  function handleIntraPoolReorder(activeId: string, overId: string) {
    const currentIds = visibleItems.map((wi) => wi.id)
    const oldIndex = currentIds.indexOf(activeId)
    const newIndex = currentIds.indexOf(overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reorderedIds = arrayMove(currentIds, oldIndex, newIndex)
    setOrderedIds(reorderedIds)
    const draggedItem = visibleItems.find((wi) => wi.id === activeId)
    if (!draggedItem) return
    const afterWorkItemId = newIndex > 0 ? (reorderedIds[newIndex - 1] ?? null) : null
    moveInPool({ workItemId: activeId, version: draggedItem.version, afterWorkItemId })
  }

  async function handleBoardColumnDrop(event: DragEndEvent) {
    const activator = event.activatorEvent as PointerEvent
    const cx = activator.clientX + event.delta.x
    const cy = activator.clientY + event.delta.y
    const elements = document.elementsFromPoint(cx, cy)
    let columnId: string | null = null
    for (const el of elements) {
      const found = el instanceof HTMLElement ? el.closest('[data-column-id]') : null
      if (found instanceof HTMLElement) {
        columnId = found.getAttribute('data-column-id')
        break
      }
    }
    if (!columnId) return
    const workItemId = String(event.active.id)
    const workItem = visibleItems.find((wi) => wi.id === workItemId)
    if (workItem) {
      try {
        await assignToColumn({ workItemId, boardColumnId: columnId, version: workItem.version })
      } catch {
        /* toast handled in hook */
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActivePoolItem(null)
    const { active, over } = event
    const poolItemIds = new Set(visibleItems.map((wi) => wi.id))
    const overIsPoolItem =
      over !== null && over.id !== active.id && poolItemIds.has(String(over.id))
    if (overIsPoolItem) {
      handleIntraPoolReorder(String(active.id), String(over.id))
      return
    }
    if (currentBoardId) await handleBoardColumnDrop(event)
  }

  return {
    sensors,
    activePoolItem,
    isBoardCardDragOver: nativeDrag.isBoardCardDragOver,
    handleDragStart,
    handleDragEnd,
    handleDragCancel: () => setActivePoolItem(null),
    handleNativeDragOver: nativeDrag.handleNativeDragOver,
    handleNativeDragLeave: nativeDrag.handleNativeDragLeave,
    handleNativeDrop: nativeDrag.handleNativeDrop,
  }
}
