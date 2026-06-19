import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { toCreateInput } from '../../api/workItemMutationApi'
import { useCreateProjectWorkItem } from '../../hooks/useCreateProjectWorkItem'
import { useCreateWorkItemDialogStore } from '../../store/workItemDialogStores'
import { workItemFormSchema, type WorkItemFormValues } from '../../utils/workItemFormSchema'
import { WorkItemForm } from '../WorkItemForm'

interface CreateWorkItemDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Dialog for creating a new work item within a scope.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope type (e.g. 'Project').
 * @param root0.scopeId - The ID of the scope.
 * @returns The create work item dialog element.
 */
export function CreateWorkItemDialog({ scopeType, scopeId }: CreateWorkItemDialogProps) {
  const { t } = useTranslation()
  const open = useCreateWorkItemDialogStore((s) => s.open)
  const closeModal = useCreateWorkItemDialogStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useCreateProjectWorkItem(scopeType, scopeId)

  const form = useForm<WorkItemFormValues>({
    resolver: zodResolver(workItemFormSchema),
    defaultValues: { name: '', description: null, dueDate: null, priority: null, assigneeId: null },
  })

  async function onSubmit(values: WorkItemFormValues) {
    const input = toCreateInput(values, scopeId, scopeType)
    try {
      await mutateAsync({ input })
      closeModal()
      form.reset()
    } catch {
      // onError in the hook handles user-facing feedback
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal()
      form.reset()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="sm:max-w-xl"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.workItem.createDialog.title', 'Create Task')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <WorkItemForm
            form={form}
            isPending={isPending}
            onSubmit={form.handleSubmit(onSubmit)}
            onCancel={closeModal}
            submitLabel={t('features.workItem.createDialog.submit', 'Create')}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
