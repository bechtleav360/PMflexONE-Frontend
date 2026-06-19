import { useTranslation } from 'react-i18next'

import type { DomainType, MatrixRole, RoleGroup } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useEditObjectRole } from '../hooks/useEditObjectRole'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import type { ObjectRoleFormValues } from './ObjectRoleForm'
import { ObjectRoleForm } from './ObjectRoleForm'

const FORM_ID = 'edit-object-role-dialog-form'

interface EditObjectRoleDialogProps {
  open: boolean
  /** The role being edited (used to pre-fill form and pass id to mutation). */
  role: MatrixRole | undefined
  /** Available role groups for the groupId select. */
  roleGroups: RoleGroup[]
  /** The object ID this role belongs to. */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
}

/**
 * Dialog for editing an existing object-level role (custom role on a project/program/portfolio).
 * Pre-fills the form with the current role data and calls `useEditObjectRole` on submit.
 *
 * @param props - Dialog configuration.
 * @returns The rendered edit object role dialog.
 */
export function EditObjectRoleDialog({
  open,
  role,
  roleGroups,
  objectId,
  domainType,
}: EditObjectRoleDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRasciMatrixStore()
  const { mutateAsync, isPending } = useEditObjectRole()

  async function handleSubmit(values: ObjectRoleFormValues) {
    if (!role) return
    await mutateAsync({
      objectId,
      domainType,
      input: {
        id: role.id,
        objectId,
        name: values.name,
        shortTitle: values.shortTitle,
        description: values.description || undefined,
        groupId: values.groupId,
        tasks: role.tasks,
      },
    })
    closeAll()
  }

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
          <DialogTitle>{t('pages.rasciMatrix.editRole', 'Edit role')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {role && (
            <ObjectRoleForm
              formId={FORM_ID}
              templateRoles={[]}
              roleGroups={roleGroups}
              objectId={objectId}
              onSubmit={handleSubmit}
              isPending={isPending}
              hideSourceRole
              defaultValues={{
                name: role.name,
                shortTitle: role.shortTitle,
                description: role.description ?? '',
                groupId: role.groupId,
                tasks: role.tasks,
              }}
            />
          )}
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
