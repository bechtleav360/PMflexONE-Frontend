import { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { useWorkItem } from '@/entities/work-item'
import { useArchiveWorkItem } from '@/features/work-item-crud'
import type { ScopeType } from '@/shared/types/scopeType'

import { type DetailPanelMode } from './taskDetailPanelTypes'
import { useTaskDetailForm } from './useTaskDetailForm'
import { useTaskDetailInvalidation } from './useTaskDetailInvalidation'

interface UseTaskDetailPanelProps {
  workItemId: string | null
  mode: DetailPanelMode
  scopeType: ScopeType
  scopeId: string
  boardColumnId?: string | null
  onClose: () => void
  onCreated?: (workItemId: string, version: number) => void
}

/**
 * Orchestrates state and actions for the TaskDetailPanel dialog —
 * manages panel mode, archive/delete confirmation dialogs, and delegates
 * to {@link useTaskDetailForm} for form logic.
 * @param props - Configuration props for the panel.
 * @returns All state values and handlers required by TaskDetailPanel.
 */
export function useTaskDetailPanel({
  workItemId,
  mode,
  scopeType,
  scopeId,
  boardColumnId,
  onClose,
  onCreated,
}: UseTaskDetailPanelProps) {
  const { t } = useTranslation()
  const [localOverride, setLocalOverride] = useState<{
    forMode: DetailPanelMode
    value: DetailPanelMode
  } | null>(null)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Override is only valid for the mode it was set against; auto-invalidates when mode changes.
  const effectiveMode = localOverride?.forMode === mode ? localOverride.value : mode
  const setInternalMode = useCallback(
    (m: DetailPanelMode) => setLocalOverride({ forMode: mode, value: m }),
    [mode],
  )

  const { data: workItem } = useWorkItem(workItemId ?? '')
  const { mutateAsync: archive } = useArchiveWorkItem()
  const { handleDeleteConfirmed, isDeleting } = useTaskDetailInvalidation({
    scopeType,
    scopeId,
    onClose,
  })

  const { form, isPending, isAssignedToColumn, handleCreate, handleUpdate } = useTaskDetailForm({
    workItem,
    internalMode: effectiveMode,
    scopeType,
    scopeId,
    boardColumnId,
    onCreated,
    setInternalMode,
  })

  const title =
    effectiveMode === 'create'
      ? t('features.workItem.createDialog.title', 'Create Task')
      : (workItem?.name ?? '')

  function handleDeleteClick() {
    setDeleteConfirmOpen(false)
    if (workItem) void handleDeleteConfirmed(workItem)
  }

  async function handleArchiveConfirmed() {
    if (!workItem) return
    try {
      await archive({ id: workItem.id, version: workItem.version })
      setArchiveConfirmOpen(false)
      onClose()
    } catch {
      /* hook handles toast */
    }
  }

  function handleArchiveClick() {
    if (workItem?.archived) {
      void archive({ id: workItem.id, version: workItem.version })
        .then(onClose)
        .catch(() => {
          /* mutation hook handles toast */
        })
    } else {
      setArchiveConfirmOpen(true)
    }
  }

  return {
    internalMode: effectiveMode,
    setInternalMode,
    archiveConfirmOpen,
    setArchiveConfirmOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    workItem,
    form,
    isPending,
    isAssignedToColumn,
    isDeleting,
    title,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleArchiveConfirmed,
    handleArchiveClick,
  }
}
