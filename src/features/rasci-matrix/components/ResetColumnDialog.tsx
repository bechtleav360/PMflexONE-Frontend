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

import { useResetRolePermissions } from '../hooks/useResetRolePermissions'
import { useRasciMatrixStore } from '../store/rasciMatrixStore'

interface ResetColumnDialogProps {
  /** Whether the dialog is currently open. */
  open: boolean
  /** The object ID (project / program / portfolio). */
  objectId: string
  /** The domain type of the object. */
  domainType: DomainType
}

/**
 * Confirmation dialog for resetting all permission overrides for a role column.
 * Gets the selected role ID from the RASCI matrix store.
 * On confirm: calls `useResetRolePermissions`.
 * On cancel / close: calls `store.closeAll()`.
 *
 * @param props - Dialog configuration.
 * @returns The rendered reset column dialog.
 */
export function ResetColumnDialog({ open, objectId, domainType }: ResetColumnDialogProps) {
  const { t } = useTranslation()
  const { selectedColumnRoleId, closeAll } = useRasciMatrixStore()
  const { mutateAsync, isPending } = useResetRolePermissions()

  async function handleConfirm() {
    if (selectedColumnRoleId === null) return
    await mutateAsync({ objectId, domainType, roleId: selectedColumnRoleId })
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
        aria-describedby="reset-column-description"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.rasciMatrix.resetColumn')}</DialogTitle>
          <DialogDescription id="reset-column-description">
            {t('pages.rasciMatrix.resetColumnConfirm')}
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
            data-testid="reset-column-confirm-btn"
          >
            {t('pages.rasciMatrix.resetColumn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
