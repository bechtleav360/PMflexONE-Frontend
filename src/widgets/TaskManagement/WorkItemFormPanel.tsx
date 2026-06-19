import { useTranslation } from 'react-i18next'

import {
  WorkItemForm,
  type WorkItemFormHandle,
  type WorkItemFormValues,
} from '@/features/work-item-crud'
import type { ScopeType } from '@/shared/types/scopeType'

import { TaskCreatePanel } from './TaskCreatePanel'
import type { DetailPanelMode } from './taskDetailPanelTypes'
import { TaskDetailTabs } from './TaskDetailTabs'

interface WorkItemFormPanelProps {
  internalMode: DetailPanelMode
  workItemId: string | null
  form: WorkItemFormHandle
  isPending: boolean
  isAssignedToColumn: boolean
  scopeType: ScopeType
  scopeId: string
  onSubmitCreate: (values: WorkItemFormValues) => Promise<void>
  onSubmitUpdate: (values: WorkItemFormValues) => Promise<void>
  onCancelCreate: () => void
  onCancelEdit: () => void
  onOpenWorkItem?: (id: string) => void
}

/**
 * Renders the form panel body for the task detail dialog, switching between
 * create, edit, and view (tab) modes based on the current internal panel mode.
 * @param props - Component props.
 * @returns The rendered form or tab content for the task detail panel.
 */
export function WorkItemFormPanel({
  internalMode,
  workItemId,
  form,
  isPending,
  isAssignedToColumn,
  scopeType,
  scopeId,
  onSubmitCreate,
  onSubmitUpdate,
  onCancelCreate,
  onCancelEdit,
  onOpenWorkItem,
}: WorkItemFormPanelProps) {
  const { t } = useTranslation()

  const editForm =
    internalMode === 'edit' ? (
      <WorkItemForm
        form={form}
        isPending={isPending}
        onSubmit={form.handleSubmit(onSubmitUpdate)}
        onCancel={onCancelEdit}
        submitLabel={t('features.workItem.editDialog.submit', 'Save')}
        showStatus
        disableStatus={isAssignedToColumn}
        scopeType={scopeType}
        scopeId={scopeId}
      />
    ) : undefined

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      {internalMode === 'create' ? (
        <TaskCreatePanel
          form={form}
          isPending={isPending}
          scopeType={scopeType}
          scopeId={scopeId}
          onSubmit={form.handleSubmit(onSubmitCreate)}
          onCancel={onCancelCreate}
        />
      ) : (
        workItemId && (
          <TaskDetailTabs
            key={workItemId}
            workItemId={workItemId}
            scopeType={scopeType}
            scopeId={scopeId}
            editContent={editForm}
            onOpenWorkItem={onOpenWorkItem}
          />
        )
      )}
    </div>
  )
}
