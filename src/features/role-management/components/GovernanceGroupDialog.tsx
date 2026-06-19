import { useTranslation } from 'react-i18next'

import type { RoleGroup } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useAddRoleGroup } from '../hooks/useAddRoleGroup'
import { useEditRoleGroup } from '../hooks/useEditRoleGroup'
import { useRoleManagementStore } from '../store/roleManagementStore'
import type { GovernanceGroupFormValues } from './GovernanceGroupForm'
import { GovernanceGroupForm } from './GovernanceGroupForm'

const FORM_ID = 'governance-group-dialog-form'

interface GovernanceGroupDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** The existing group when editing; null when creating. */
  group: RoleGroup | null
}

/**
 * Dialog for creating or editing a governance (role) group.
 * In Add mode (group null): calls `useAddRoleGroup` on submit.
 * In Edit mode (group provided): calls `useEditRoleGroup` on submit.
 *
 * @param props - Dialog configuration.
 * @returns The rendered governance group dialog.
 */
export function GovernanceGroupDialog({ open, group }: GovernanceGroupDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRoleManagementStore()
  const { mutateAsync: addGroup, isPending: isAddPending } = useAddRoleGroup()
  const { mutateAsync: editGroup, isPending: isEditPending } = useEditRoleGroup()

  const isEditMode = group !== null
  const isPending = isAddPending || isEditPending

  const title = isEditMode
    ? t('pages.roleManagement.editGroup')
    : t('pages.roleManagement.addGroup')

  async function handleSubmit(values: GovernanceGroupFormValues) {
    if (isEditMode && group) {
      await editGroup({
        id: group.id,
        name: values.name,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        color: values.color || undefined,
      })
    } else {
      await addGroup({
        name: values.name,
        description: values.description || undefined,
        sortOrder: values.sortOrder,
        color: values.color || undefined,
      })
    }
    closeAll()
  }

  const defaultValues: Partial<GovernanceGroupFormValues> = group
    ? {
        name: group.name,
        description: group.description ?? '',
        sortOrder: group.sortOrder,
        color: group.color ?? '',
      }
    : {}

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <GovernanceGroupForm
            key={group?.id ?? 'new'}
            formId={FORM_ID}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeAll}
            disabled={isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
