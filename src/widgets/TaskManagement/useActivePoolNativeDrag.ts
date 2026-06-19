import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY, WORK_ITEMS_QUERY_KEY } from '@/entities/work-item'
import type { ProjectWorkItem } from '@/entities/work-item'
import { useMoveWorkItemInPool } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

interface UseActivePoolNativeDragOptions {
  scopeType: ScopeType
  scopeId: string
  currentBoardId: string
  visibleItems: ProjectWorkItem[]
}

interface UseActivePoolNativeDragResult {
  isBoardCardDragOver: boolean
  handleNativeDragOver: (e: React.DragEvent) => void
  handleNativeDragLeave: (e: React.DragEvent) => void
  handleNativeDrop: (e: React.DragEvent) => void
}

/**
 * Handles HTML5 native drag-over / drop from board cards into the active pool.
 * Manages the drag-over highlight state and the optimistic cache update on drop.
 * @param options - Configuration options for the hook.
 * @returns Drag-over state flag and native drag event handlers for the pool drop target.
 */
export function useActivePoolNativeDrag({
  scopeType,
  scopeId,
  currentBoardId,
  visibleItems,
}: UseActivePoolNativeDragOptions): UseActivePoolNativeDragResult {
  const queryClient = useQueryClient()
  const [isBoardCardDragOver, setIsBoardCardDragOver] = useState(false)
  const { mutate: moveInPool } = useMoveWorkItemInPool(scopeType, scopeId, {
    onSettled: () => {},
  })

  function handleNativeDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('text/work-item-source')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setIsBoardCardDragOver(true)
    }
  }

  function handleNativeDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsBoardCardDragOver(false)
    }
  }

  function handleNativeDrop(e: React.DragEvent) {
    setIsBoardCardDragOver(false)
    const source = e.dataTransfer.getData('text/work-item-source')
    if (source !== 'board') return
    const workItemId = e.dataTransfer.getData('text/work-item-id')
    const version = parseInt(e.dataTransfer.getData('text/work-item-version'), 10)
    if (!workItemId || isNaN(version)) return
    if (currentBoardId) {
      queryClient.setQueriesData<{ columns: Array<{ workItems: ProjectWorkItem[] }> }>(
        { queryKey: BOARD_QUERY_KEY(currentBoardId) },
        (old) =>
          old
            ? {
                ...old,
                columns: old.columns.map((col) => ({
                  ...col,
                  workItems: col.workItems.filter((wi) => wi.id !== workItemId),
                })),
              }
            : old,
      )
    }
    const afterWorkItemId = visibleItems[visibleItems.length - 1]?.id ?? null
    moveInPool(
      { workItemId, version, afterWorkItemId },
      {
        onSettled: () => {
          if (currentBoardId)
            void queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(currentBoardId) })
          void queryClient.invalidateQueries({ queryKey: WORK_ITEMS_QUERY_KEY(scopeType, scopeId) })
        },
      },
    )
  }

  return { isBoardCardDragOver, handleNativeDragOver, handleNativeDragLeave, handleNativeDrop }
}
