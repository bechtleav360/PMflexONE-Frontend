import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useWorkItem } from '@/entities/work-item'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'

import { toUpdateInput } from '../../api/workItemMutationApi'
import { useUpdateProjectWorkItem } from '../../hooks/useUpdateProjectWorkItem'
import { useEditWorkItemDialogStore } from '../../store/workItemDialogStores'
import { workItemFormSchema } from '../../utils/workItemFormSchema'
import { WorkItemForm } from '../WorkItemForm'

const editFormSchema = workItemFormSchema.extend({
  status: z.string().nullable().optional(),
})

type EditFormValues = z.infer<typeof editFormSchema>

/**
 * Dialog for editing an existing work item.
 * @returns The edit work item dialog element.
 */
export function EditWorkItemDialog() {
  const { t } = useTranslation()
  const open = useEditWorkItemDialogStore((s) => s.open)
  const payload = useEditWorkItemDialogStore((s) => s.payload)
  const closeModal = useEditWorkItemDialogStore((s) => s.closeModal)

  const workItemId = payload?.workItemId ?? ''
  const { data: workItem, isLoading } = useWorkItem(workItemId)
  const { mutateAsync, isPending } = useUpdateProjectWorkItem()

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: '',
      description: null,
      dueDate: null,
      priority: null,
      assigneeId: null,
      status: null,
    },
  })

  useEffect(() => {
    if (workItem) {
      form.reset({
        name: workItem.name,
        description: workItem.description ?? null,
        dueDate: workItem.dueDate ?? null,
        priority: workItem.priority ?? null,
        assigneeId: workItem.assignee?.id ?? null,
        status: workItem.status ?? null,
      })
    }
  }, [workItem, form])

  async function onSubmit(values: EditFormValues) {
    if (!workItem) return
    // Board-assigned tasks cannot have their status changed via updateProjectWorkItem —
    // status is controlled exclusively by column assignment. Strip it to avoid
    // STATUS_CHANGE_BLOCKED_BY_BOARD errors that would silently block the dialog from closing.
    const effectiveValues = isAssignedToColumn ? { ...values, status: null } : values
    const input = toUpdateInput(effectiveValues, workItem.version)
    try {
      await mutateAsync({ id: workItemId, input })
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

  const isAssignedToColumn = workItem?.boardColumn !== null && workItem?.boardColumn !== undefined
  // rejected cannot be changed via updateProjectWorkItem (WorkItemBaseStatus only)
  const isRejected = workItem?.status === 'REJECTED'

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
          <DialogTitle>{t('features.workItem.editDialog.title', 'Edit Task')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {!isLoading && (
            <WorkItemForm
              form={form as unknown as Parameters<typeof WorkItemForm>[0]['form']}
              isPending={isPending}
              onSubmit={form.handleSubmit(onSubmit)}
              onCancel={closeModal}
              submitLabel={t('features.workItem.editDialog.submit', 'Save')}
              showStatus
              disableStatus={isAssignedToColumn || isRejected}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
