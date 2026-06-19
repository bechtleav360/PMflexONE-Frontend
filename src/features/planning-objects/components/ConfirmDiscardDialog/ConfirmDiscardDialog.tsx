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

/** Props for {@link ConfirmDiscardDialog}. */
export interface ConfirmDiscardDialogProps {
  /** Whether the dialog is visible. */
  open: boolean
  /** Called when the user confirms discarding changes. */
  onConfirm: () => void
  /** Called when the user cancels and wants to keep editing. */
  onCancel: () => void
}

/**
 * Confirmation dialog shown when the user attempts to close an edit dialog
 * that has unsaved changes.
 *
 * @param props - Component props.
 * @returns The rendered confirmation dialog.
 */
export function ConfirmDiscardDialog({ open, onConfirm, onCancel }: ConfirmDiscardDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('features.planningObjects.common.discardTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground text-sm">
            {t('features.planningObjects.common.discardDescription')}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {t('features.planningObjects.common.discardCancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            {t('features.planningObjects.common.discardConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
