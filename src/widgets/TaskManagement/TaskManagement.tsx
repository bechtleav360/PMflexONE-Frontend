import { useEffect, useState } from 'react'

import { DeleteBoardDialog, useCreateBoardDialogStore } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

import { BoardToolbar } from './BoardToolbar'
import { TaskBoardSection } from './TaskBoardSection'
import { TaskDetailPanel } from './TaskDetailPanel'
import { TaskManagementDialogs } from './TaskManagementDialogs'
import { TaskPoolsRightSidebar } from './TaskPoolsRightSidebar'
import { useActiveBoardState } from './useActiveBoardState'
import { useTaskPanelState } from './useTaskPanelState'

interface TaskManagementProps {
  scopeType: ScopeType
  scopeId: string
  /** Called on mount and whenever the active board name changes (for breadcrumb use). */
  onActiveBoardNameChange?: (name: string | null) => void
}

/**
 * Top-level task management widget — boards, pools, labels, and dialogs for a given scope.
 * @param root0 - Component props.
 * @param root0.scopeType - The entity type that owns the tasks (e.g. "project").
 * @param root0.scopeId - The ID of the owning entity.
 * @param root0.onActiveBoardNameChange - Called on mount and whenever the active board name changes.
 * @returns The full task management UI including tabs, boards, and modal dialogs.
 */
export function TaskManagement({
  scopeType,
  scopeId,
  onActiveBoardNameChange,
}: TaskManagementProps) {
  const {
    boards,
    boardsLoading,
    activeBoardId,
    activeBoardName,
    assignedWorkItemIds,
    handleBoardChange,
    handleBoardDeleted,
  } = useActiveBoardState(scopeType, scopeId)

  useEffect(() => {
    onActiveBoardNameChange?.(activeBoardName)
  }, [activeBoardName, onActiveBoardNameChange])

  const openCreateBoard = useCreateBoardDialogStore((s) => s.openModal)
  const [deleteBoardTargetId, setDeleteBoardTargetId] = useState<string | null>(null)
  const {
    detailWorkItemId,
    panelMode,
    createColumnId,
    openCreate,
    openView,
    closePanel,
    handleCreated,
  } = useTaskPanelState(activeBoardId)

  return (
    <div className="flex h-full flex-col gap-4">
      <BoardToolbar
        activeBoardId={activeBoardId}
        activeBoardName={activeBoardName}
        boardsEmpty={boards.length === 0}
        scopeType={scopeType}
        scopeId={scopeId}
        onDeleteBoardClick={() => {
          if (activeBoardId) setDeleteBoardTargetId(activeBoardId)
        }}
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TaskBoardSection
          boardsLoading={boardsLoading}
          boards={boards}
          activeBoardId={activeBoardId}
          scopeType={scopeType}
          onBoardChange={handleBoardChange}
          onCreateBoard={openCreateBoard}
          onBoardDeleted={handleBoardDeleted}
          onSelect={openView}
          onAddTask={(columnId) => openCreate(columnId)}
        />
      </div>
      <TaskPoolsRightSidebar
        scopeType={scopeType}
        scopeId={scopeId}
        assignedWorkItemIds={assignedWorkItemIds}
        currentBoardId={activeBoardId ?? ''}
        onSelect={openView}
        onCreateTask={() => openCreate()}
      />
      {deleteBoardTargetId !== null && (
        <DeleteBoardDialog
          boardId={deleteBoardTargetId}
          open={true}
          onOpenChange={(open) => {
            if (!open) setDeleteBoardTargetId(null)
          }}
          onDeleted={() => {
            const id = deleteBoardTargetId
            setDeleteBoardTargetId(null)
            handleBoardDeleted(id)
          }}
        />
      )}
      <TaskManagementDialogs
        scopeType={scopeType}
        scopeId={scopeId}
        detailWorkItemId={detailWorkItemId}
      />
      <TaskDetailPanel
        workItemId={detailWorkItemId}
        mode={panelMode}
        scopeType={scopeType}
        scopeId={scopeId}
        boardColumnId={createColumnId}
        onClose={closePanel}
        onCreated={handleCreated}
        onOpenWorkItem={openView}
      />
    </div>
  )
}
