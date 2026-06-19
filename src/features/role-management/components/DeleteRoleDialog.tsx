import { useTranslation } from 'react-i18next'

import type { MatrixRole } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useDeleteRole } from '../hooks/useDeleteRole'
import { useRoleManagementStore } from '../store/roleManagementStore'

interface DeleteRoleDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean
  /** The role to delete (null when not selected). */
  role: MatrixRole | null
  /** The matrix id (used for cache invalidation). */
  matrixId: string
}

/**
 * Confirmation dialog for deleting a role.
 * Shows the role name and, if the role is fixed, a system role warning.
 * Calls `useDeleteRole` on confirmation.
 *
 * @param props - Dialog configuration.
 * @returns The rendered delete confirmation dialog.
 */
export function DeleteRoleDialog({ open, role, matrixId }: DeleteRoleDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRoleManagementStore()
  const { mutateAsync, isPending } = useDeleteRole()

  async function handleConfirm() {
    if (role === null) return
    await mutateAsync({ id: role.id, matrixId })
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
        className="sm:max-w-md"
        aria-describedby="delete-role-description"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.roleManagement.deleteRole')}</DialogTitle>
          <DialogDescription id="delete-role-description">
            {role?.isFixed
              ? t('pages.roleManagement.fixed')
              : t('pages.roleManagement.deleteRoleConfirm', {
                  name: role?.name ?? '',
                })}
          </DialogDescription>
        </DialogHeader>

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
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || role?.isFixed === true}
            aria-disabled={isPending}
            data-testid="delete-confirm-btn"
          >
            {t('common.delete', 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
