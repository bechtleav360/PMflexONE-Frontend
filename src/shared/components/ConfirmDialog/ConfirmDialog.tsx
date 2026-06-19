import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/Dialog'

/** Props for the ConfirmDialog component. */
export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Visual intent — 'destructive' renders the confirm button in red. */
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  isPending?: boolean
}

/**
 * Generic confirmation dialog wrapping the shared Dialog primitive.
 * Use for any action that requires explicit user confirmation before execution.
 * Does not close on overlay click while `isPending` is true.
 * @param root0 - Component props.
 * @param root0.open - Whether the dialog is open.
 * @param root0.onOpenChange - Called when the open state changes.
 * @param root0.title - Dialog title text.
 * @param root0.description - Optional descriptive text shown below the title.
 * @param root0.confirmLabel - Label for the confirm button.
 * @param root0.cancelLabel - Label for the cancel button.
 * @param root0.variant - Visual intent; 'destructive' renders the confirm button in red.
 * @param root0.onConfirm - Called when the user clicks the confirm button.
 * @param root0.isPending - When true, disables both buttons and blocks close-on-overlay.
 * @returns The confirmation dialog element.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel ?? t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel ?? t('common.confirm', 'Confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
