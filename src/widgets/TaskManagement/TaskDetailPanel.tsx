import { Dialog, DialogContent } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { PanelConfirmDialogs } from './PanelConfirmDialogs'
import { PanelDialogHeader } from './PanelDialogHeader'
import type { DetailPanelMode } from './taskDetailPanelTypes'
import { useTaskDetailPanel } from './useTaskDetailPanel'
import { WorkItemFormPanel } from './WorkItemFormPanel'

export type { DetailPanelMode }

interface TaskDetailPanelProps {
  workItemId: string | null
  mode: DetailPanelMode
  scopeType: ScopeType
  scopeId: string
  boardColumnId?: string | null
  onClose: () => void
  onCreated?: (workItemId: string, version: number) => void
  onOpenWorkItem?: (id: string) => void
}

/**
 * Modal dialog for viewing and editing a work item or creating a new one.
 * Delegates state and action logic to {@link useTaskDetailPanel}.
 * @param props - Component props.
 * @returns The rendered task detail dialog with optional confirm sub-dialogs.
 */
export function TaskDetailPanel({
  workItemId,
  mode,
  scopeType,
  scopeId,
  boardColumnId,
  onClose,
  onCreated,
  onOpenWorkItem,
}: TaskDetailPanelProps) {
  const {
    internalMode,
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
  } = useTaskDetailPanel({
    workItemId,
    mode,
    scopeType,
    scopeId,
    boardColumnId,
    onClose,
    onCreated,
  })

  const open = mode === 'create' || mode === 'edit' || Boolean(workItemId)

  return (
    <>
      <PanelConfirmDialogs
        archiveConfirmOpen={archiveConfirmOpen}
        setArchiveConfirmOpen={setArchiveConfirmOpen}
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        isDeleting={isDeleting}
        handleArchiveConfirmed={handleArchiveConfirmed}
        handleDeleteClick={handleDeleteClick}
      />
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setInternalMode('view')
            onClose()
          }
        }}
      >
        <DialogContent
          size="xl"
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0"
        >
          <PanelDialogHeader
            title={title}
            workItem={workItem ?? undefined}
            internalMode={internalMode}
            onEdit={() => setInternalMode('edit')}
            onArchiveClick={handleArchiveClick}
            onDeleteClick={() => setDeleteConfirmOpen(true)}
          />
          <WorkItemFormPanel
            internalMode={internalMode}
            workItemId={workItemId}
            form={form}
            isPending={isPending}
            isAssignedToColumn={isAssignedToColumn}
            scopeType={scopeType}
            scopeId={scopeId}
            onSubmitCreate={handleCreate}
            onSubmitUpdate={handleUpdate}
            onCancelCreate={() => {
              setInternalMode('view')
              onClose()
            }}
            onCancelEdit={() => setInternalMode('view')}
            onOpenWorkItem={onOpenWorkItem}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
