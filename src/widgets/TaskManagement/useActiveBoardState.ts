import { useCallback, useMemo, useState } from 'react'

import { useBoard, useBoards } from '@/entities/work-item'
import { useBoardFilterStore } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

/**
 * Manages board selection, filter reset, and derived assigned-item IDs.
 * @param scopeType - The scope entity type owning the boards.
 * @param scopeId - The ID of the scope entity.
 * @returns Board list, loading state, active board state, and board change/delete handlers.
 */
export function useActiveBoardState(scopeType: ScopeType, scopeId: string) {
  const { data: boards = [], isLoading: boardsLoading } = useBoards(scopeType, scopeId)
  const resetFilter = useBoardFilterStore((s) => s.reset)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  const activeBoardId = selectedBoardId ?? boards[0]?.id ?? null
  const { data: activeBoard } = useBoard(activeBoardId ?? '')
  const assignedWorkItemIds = useMemo(
    () =>
      new Set(activeBoard?.columns.flatMap((c) => (c.workItems ?? []).map((wi) => wi.id)) ?? []),
    [activeBoard],
  )

  const handleBoardChange = useCallback(
    (boardId: string) => {
      setSelectedBoardId(boardId)
      resetFilter()
    },
    [resetFilter],
  )

  const handleBoardDeleted = useCallback(
    (deletedId: string) => {
      setSelectedBoardId(boards.find((b) => b.id !== deletedId)?.id ?? null)
    },
    [boards],
  )

  return {
    boards,
    boardsLoading,
    activeBoardId,
    activeBoardName: activeBoard?.name ?? null,
    assignedWorkItemIds,
    handleBoardChange,
    handleBoardDeleted,
  }
}
