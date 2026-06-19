import {
  CreateBoardColumnDialog,
  CreateBoardDialog,
  EditBoardColumnDialog,
  EditBoardDialog,
} from '@/features/work-item-board'
import { CreateLabelDialog, EditLabelDialog, LabelManagerDialog } from '@/features/work-item-labels'
import { CreateWorkItemLinkDialog } from '@/features/work-item-links'
import type { ScopeType } from '@/shared/types/scopeType'

interface TaskManagementDialogsProps {
  scopeType: ScopeType
  scopeId: string
  detailWorkItemId: string | null
}

/**
 * Renders modal dialogs used by the TaskManagement widget (board/label/link dialogs only; work-item forms live in TaskDetailPanel).
 * @param root0 - Component props.
 * @param root0.scopeType - Scope entity type for all dialogs.
 * @param root0.scopeId - Scope entity ID for all dialogs.
 * @param root0.detailWorkItemId - ID of the work item currently shown in the detail panel, used for the link dialog.
 * @returns A fragment containing all task management modal dialogs.
 */
export function TaskManagementDialogs({
  scopeType,
  scopeId,
  detailWorkItemId,
}: TaskManagementDialogsProps) {
  return (
    <>
      <CreateBoardDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditBoardDialog />
      <CreateBoardColumnDialog />
      <EditBoardColumnDialog />
      <CreateLabelDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <EditLabelDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <LabelManagerDialog
        scopeType={scopeType}
        scopeId={scopeId}
      />
      <CreateWorkItemLinkDialog
        workItemId={detailWorkItemId ?? ''}
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </>
  )
}
