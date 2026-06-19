import { useTranslation } from 'react-i18next'

import { useMatrix } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useAddRoleToMatrix } from '../hooks/useAddRoleToMatrix'
import { useEditRole } from '../hooks/useEditRole'
import { useRoleManagementStore } from '../store/roleManagementStore'
import type { RoleDefinitionFormValues } from './RoleDefinitionForm'
import { RoleDefinitionForm } from './RoleDefinitionForm'

const FORM_ID = 'role-definition-dialog-form'

interface RoleDefinitionDialogProps {
  /** The matrix id this role belongs to. */
  matrixId: string
  /** Whether the dialog is open. */
  open: boolean
  /** The role id when editing; null when adding. */
  roleId: string | null
}

/**
 * Dialog for creating or editing a role.
 * In Add mode (roleId null): calls `useAddRoleToMatrix` on submit.
 * In Edit mode (roleId provided): fetches the existing role and calls `useEditRole` on submit.
 *
 * @param props - Dialog configuration.
 * @returns The rendered role definition dialog.
 */
export function RoleDefinitionDialog({ matrixId, open, roleId }: RoleDefinitionDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRoleManagementStore()
  const { mutateAsync: addRole, isPending: isAddPending } = useAddRoleToMatrix()
  const { mutateAsync: editRoleAsync, isPending: isEditPending } = useEditRole()

  const isEditMode = roleId !== null

  // Fetch existing role data in edit mode
  const { data: matrixDetail } = useMatrix({ matrixId }, { enabled: isEditMode })
  const existingRole = isEditMode ? matrixDetail?.roles.find((r) => r.id === roleId) : undefined

  const isPending = isAddPending || isEditPending

  async function handleSubmit(values: RoleDefinitionFormValues) {
    if (isEditMode && roleId) {
      await editRoleAsync({
        id: roleId,
        matrixId,
        name: values.name,
        shortTitle: values.shortTitle,
        description: values.description || undefined,
        groupId: values.groupId,
        tasks: existingRole?.tasks ?? [],
      })
    } else {
      await addRole({
        matrixId,
        name: values.name,
        shortTitle: values.shortTitle,
        description: values.description || undefined,
        groupId: values.groupId,
        tasks: [],
      })
    }
    closeAll()
  }

  const title = isEditMode ? t('pages.roleManagement.editRole') : t('pages.roleManagement.addRole')

  const defaultValues = existingRole
    ? {
        name: existingRole.name,
        shortTitle: existingRole.shortTitle,
        description: existingRole.description ?? '',
        groupId: existingRole.groupId,
      }
    : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <RoleDefinitionForm
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
