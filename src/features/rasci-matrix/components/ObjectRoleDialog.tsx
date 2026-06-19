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

import { useAddRoleToObjectMatrix } from '../hooks/useAddRoleToObjectMatrix'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import type { ObjectRoleFormValues } from './ObjectRoleForm'
import { ObjectRoleForm } from './ObjectRoleForm'

const FORM_ID = 'object-role-dialog-form'

interface ObjectRoleDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean
  /** Template roles available for copying permission values. */
  templateRoles: MatrixRole[]
  /** Available role groups for the groupId select. */
  roleGroups: RoleGroup[]
  /** The object ID this role will belong to. */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
}

/**
 * Dialog for adding a custom role to an object matrix.
 * Wraps `ObjectRoleForm` in a shadcn/ui Dialog.
 * On submit: calls `useAddRoleToObjectMatrix`.
 * On cancel / close: calls `store.closeAll()`.
 *
 * @param props - Dialog configuration.
 * @returns The rendered object role dialog.
 */
export function ObjectRoleDialog({
  open,
  templateRoles,
  roleGroups,
  objectId,
  domainType,
}: ObjectRoleDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRasciMatrixStore()
  const { mutateAsync, isPending } = useAddRoleToObjectMatrix()

  async function handleSubmit(values: ObjectRoleFormValues) {
    await mutateAsync({
      objectId,
      domainType,
      input: {
        objectId,
        name: values.name,
        shortTitle: values.shortTitle,
        description: values.description || undefined,
        groupId: values.groupId,
        tasks: values.tasks,
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
          <DialogTitle>{t('pages.rasciMatrix.addRole')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <ObjectRoleForm
            formId={FORM_ID}
            templateRoles={templateRoles}
            roleGroups={roleGroups}
            objectId={objectId}
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
