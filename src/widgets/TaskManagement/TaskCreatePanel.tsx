import { useTranslation } from 'react-i18next'

import { WorkItemForm, type WorkItemFormHandle } from '@/features/work-item-crud'
import type { ScopeType } from '@/shared/types/scopeType'

interface TaskCreatePanelProps {
  form: WorkItemFormHandle
  isPending: boolean
  scopeType: ScopeType
  scopeId: string
  onSubmit: () => void
  onCancel: () => void
}

/**
 * Renders the create-mode form for a new work item inside the detail panel body.
 * @param root0 - Component props.
 * @param root0.form - react-hook-form instance pre-configured with the edit schema.
 * @param root0.isPending - Whether a mutation is in flight.
 * @param root0.scopeType - Entity type owning the work item.
 * @param root0.scopeId - ID of the owning entity.
 * @param root0.onSubmit - Submit handler bound to `form.handleSubmit`.
 * @param root0.onCancel - Called when the user cancels creation.
 * @returns The WorkItemForm configured for creation.
 */
export function TaskCreatePanel({
  form,
  isPending,
  scopeType,
  scopeId,
  onSubmit,
  onCancel,
}: TaskCreatePanelProps) {
  const { t } = useTranslation()
  return (
    <WorkItemForm
      form={form}
      isPending={isPending}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={t('features.workItem.createDialog.submit', 'Create')}
      scopeType={scopeType}
      scopeId={scopeId}
    />
  )
}
