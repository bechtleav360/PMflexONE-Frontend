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

/** Props for {@link UnsavedLogsConfirmDialog}. */
export interface UnsavedLogsConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Called when the user dismisses the dialog without confirming. */
  onClose: () => void
  /** Called when the user confirms saving despite unsaved log edits. */
  onConfirm: () => void
}

/**
 * Confirmation dialog shown when the user tries to save a stakeholder form
 * while an inline log edit is still open.
 *
 * @param props - Component props.
 * @param props.open - Controls dialog visibility.
 * @param props.onClose - Called on cancel or overlay close.
 * @param props.onConfirm - Called when the user confirms proceeding.
 * @returns A modal dialog asking the user to confirm discarding the unsaved log edit.
 */
export function UnsavedLogsConfirmDialog({
  open,
  onClose,
  onConfirm,
}: UnsavedLogsConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('pages.stakeholderRegister.form.unsavedChanges.unsavedLogsTitle')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm">
            {t('pages.stakeholderRegister.form.unsavedChanges.unsavedLogsMessage')}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('pages.stakeholderRegister.form.unsavedChanges.unsavedLogsCancel')}
          </Button>
          <Button onClick={onConfirm}>
            {t('pages.stakeholderRegister.form.unsavedChanges.unsavedLogsConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
