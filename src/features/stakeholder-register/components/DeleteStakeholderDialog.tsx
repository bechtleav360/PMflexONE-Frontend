import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import { withToast } from '@/shared/lib/withToast'
import type { ScopeType } from '@/shared/types/scopeType'

import { useDeleteStakeholder } from '../hooks/useDeleteStakeholder'
import { useDeleteStakeholderDialogStore } from '../store/useDeleteStakeholderDialogStore'

/** Props for {@link DeleteStakeholderDialog}. */
export interface DeleteStakeholderDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Confirmation dialog for deleting a stakeholder entry.
 *
 * Reads the target entry from {@link useDeleteStakeholderDialogStore} and
 * dispatches the delete mutation on confirmation.
 *
 * @param props - Component props.
 * @param props.scopeType - The type of scope the stakeholder belongs to.
 * @param props.scopeId - The ID of the scope the stakeholder belongs to.
 * @returns A dialog with Confirm and Cancel actions.
 */
export function DeleteStakeholderDialog({ scopeType, scopeId }: DeleteStakeholderDialogProps) {
  const { t } = useTranslation()
  const open = useDeleteStakeholderDialogStore((s) => s.open)
  const payload = useDeleteStakeholderDialogStore((s) => s.payload)
  const closeModal = useDeleteStakeholderDialogStore((s) => s.closeModal)
  const { mutateAsync } = useDeleteStakeholder()

  function handleConfirm() {
    if (!payload) return
    withToast(
      (args) => mutateAsync(args),
      { id: payload.id, version: payload.version, scopeType, scopeId },
      {
        loading: t('pages.stakeholderRegister.toast.deleteLoading'),
        success: t('pages.stakeholderRegister.toast.deleteSuccess'),
        error: t('pages.stakeholderRegister.toast.deleteError'),
      },
    )
    closeModal()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pages.stakeholderRegister.delete.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{t('pages.stakeholderRegister.delete.confirmMessage', { name: payload?.name })}</p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeModal}
          >
            {t('pages.stakeholderRegister.delete.cancelButton')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            {t('pages.stakeholderRegister.delete.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
