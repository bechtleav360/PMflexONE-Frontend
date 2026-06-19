import { useTranslation } from 'react-i18next'

import type { DomainType } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useDeleteObjectRole } from '../hooks/useDeleteObjectRole'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'

interface DeleteObjectRoleDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean
  /** The object ID (project / program / portfolio). */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
  /** The display name of the role being deleted (for confirmation text). */
  roleName: string
}

/**
 * Confirmation dialog for removing a custom role from an object matrix.
 * Gets the selected role ID from the RASCI matrix store.
 * On confirm: calls `useDeleteObjectRole`.
 * On cancel / close: calls `store.closeAll()`.
 *
 * @param props - Dialog configuration.
 * @returns The rendered delete object role dialog.
 */
export function DeleteObjectRoleDialog({
  open,
  objectId,
  domainType,
  roleName,
}: DeleteObjectRoleDialogProps) {
  const { t } = useTranslation()
  const { selectedColumnRoleId, closeAll } = useRasciMatrixStore()
  const { mutateAsync, isPending } = useDeleteObjectRole()

  async function handleConfirm() {
    if (selectedColumnRoleId === null) return
    await mutateAsync({ id: selectedColumnRoleId, objectId, domainType })
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
        aria-describedby="delete-object-role-description"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.rasciMatrix.deleteRole')}</DialogTitle>
          <DialogDescription id="delete-object-role-description">
            {t('pages.rasciMatrix.deleteRoleConfirm', { roleName })}
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
            disabled={isPending}
            aria-disabled={isPending}
            data-testid="delete-role-confirm-btn"
          >
            {t('common.delete', 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
