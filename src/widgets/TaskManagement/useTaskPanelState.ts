import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import type { DetailPanelMode } from './taskDetailPanelTypes'

/**
 * Manages detail panel state and handlers for the TaskManagement widget.
 * @param activeBoardId - Currently active board ID (used to invalidate board query on item create).
 * @returns Panel state and action handlers.
 */
export function useTaskPanelState(activeBoardId: string | null) {
  const queryClient = useQueryClient()
  const [detailWorkItemId, setDetailWorkItemId] = useState<string | null>(null)
  const [panelMode, setPanelMode] = useState<DetailPanelMode>('view')
  const [createColumnId, setCreateColumnId] = useState<string | null>(null)

  function openCreate(columnId?: string) {
    setCreateColumnId(typeof columnId === 'string' ? columnId : null)
    setDetailWorkItemId(null)
    setPanelMode('create')
  }

  function openView(id: string) {
    setDetailWorkItemId(id)
    setPanelMode('view')
  }

  function closePanel() {
    setDetailWorkItemId(null)
    setPanelMode('view')
  }

  async function handleCreated(id: string, _version: number) {
    if (createColumnId) {
      setCreateColumnId(null)
      closePanel()
      if (activeBoardId)
        await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(activeBoardId) })
    } else {
      setDetailWorkItemId(id)
      setPanelMode('view')
    }
  }

  return {
    detailWorkItemId,
    panelMode,
    createColumnId,
    openCreate,
    openView,
    closePanel,
    handleCreated,
  }
}
