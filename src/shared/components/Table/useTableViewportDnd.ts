import * as React from 'react'

import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core'

import type { TableColumn, TableColumnReorderPlacement } from './TableTypes'
import { useTableColumnReorderDnd } from './useTableColumnReorderDnd'

/** Column id and which side of it the dragged column will be placed on drop. */
export interface DropTarget {
  id: string
  side: 'before' | 'after'
}

interface UseTableViewportDndParams<T> {
  isColumnReorderingEnabled: boolean
  orderedColumns: TableColumn<T>[]
  handleColumnReorder: (
    sourceColumnId: string,
    targetColumnId: string,
    placement: TableColumnReorderPlacement,
  ) => void
}

interface UseTableViewportDndResult<T> {
  sensors: ReturnType<typeof useTableColumnReorderDnd>['sensors']
  activeColumnId: string | null
  activeColumn: TableColumn<T> | null
  dropTarget: DropTarget | null
  handleDragStart: (event: DragStartEvent) => void
  handleDragMove: (event: DragMoveEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
}

/**
 * Manages all dnd-kit drag state and callbacks for column reordering in the table viewport.
 * @param params - Hook parameters.
 * @param params.isColumnReorderingEnabled - Whether column reordering is active.
 * @param params.orderedColumns - Current column order used for side detection.
 * @param params.handleColumnReorder - Called with the final reorder result on drag end.
 * @returns DnD sensors, active/drop state, and event handlers to pass to `DndContext`.
 */
// eslint-disable-next-line max-lines-per-function -- cohesive hook; extracting individual drag-event handlers would fragment the drag-state machine
export function useTableViewportDnd<T>({
  isColumnReorderingEnabled,
  orderedColumns,
  handleColumnReorder,
}: UseTableViewportDndParams<T>): UseTableViewportDndResult<T> {
  const { sensors } = useTableColumnReorderDnd()
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null)
  const activeColumn = React.useMemo(
    () => (activeColumnId ? (orderedColumns.find((c) => c.id === activeColumnId) ?? null) : null),
    [activeColumnId, orderedColumns],
  )

  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null)
  const dropTargetRef = React.useRef<DropTarget | null>(null)
  const pointerXRef = React.useRef(0)
  const cleanupPointerTrackingRef = React.useRef<(() => void) | null>(null)

  const updateDropTarget = React.useCallback((next: DropTarget | null) => {
    dropTargetRef.current = next
    setDropTarget((prev) => {
      if (!next) return null
      if (prev?.id === next.id && prev.side === next.side) return prev
      return next
    })
  }, [])

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    document.body.style.cursor = 'grabbing'
    setActiveColumnId(String(event.active.id))
    const onPointerMove = (e: PointerEvent) => {
      pointerXRef.current = e.clientX
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    cleanupPointerTrackingRef.current = () =>
      window.removeEventListener('pointermove', onPointerMove)
  }, [])

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      if (!event.over || !isColumnReorderingEnabled) {
        updateDropTarget(null)
        return
      }
      const sourceId = String(event.active.id)
      const targetId = String(event.over.id)
      if (sourceId === targetId) {
        updateDropTarget(null)
        return
      }
      const targetCenterX = event.over.rect.left + event.over.rect.width / 2
      let side: 'before' | 'after' = pointerXRef.current < targetCenterX ? 'before' : 'after'
      const sourceIdx = orderedColumns.findIndex((c) => c.id === sourceId)
      const targetIdx = orderedColumns.findIndex((c) => c.id === targetId)
      if (side === 'before' && sourceIdx + 1 === targetIdx) side = 'after'
      else if (side === 'after' && sourceIdx - 1 === targetIdx) side = 'before'
      updateDropTarget({ id: targetId, side })
    },
    [isColumnReorderingEnabled, orderedColumns, updateDropTarget],
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      document.body.style.cursor = ''
      setActiveColumnId(null)
      cleanupPointerTrackingRef.current?.()
      cleanupPointerTrackingRef.current = null
      const currentDropTarget = dropTargetRef.current
      updateDropTarget(null)
      if (!event.over || !isColumnReorderingEnabled) return
      const sourceId = String(event.active.id)
      const targetId = currentDropTarget ? currentDropTarget.id : String(event.over.id)
      if (sourceId === targetId) return
      const side =
        currentDropTarget?.id === targetId
          ? currentDropTarget.side
          : orderedColumns.findIndex((c) => c.id === sourceId) <
              orderedColumns.findIndex((c) => c.id === targetId)
            ? 'after'
            : 'before'
      handleColumnReorder(sourceId, targetId, side)
    },
    [isColumnReorderingEnabled, orderedColumns, handleColumnReorder, updateDropTarget],
  )

  const handleDragCancel = React.useCallback(() => {
    document.body.style.cursor = ''
    setActiveColumnId(null)
    cleanupPointerTrackingRef.current?.()
    cleanupPointerTrackingRef.current = null
    updateDropTarget(null)
  }, [updateDropTarget])

  return {
    sensors,
    activeColumnId,
    activeColumn,
    dropTarget,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  }
}
