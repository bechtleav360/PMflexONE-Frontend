import { Loader2 } from 'lucide-react'
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

/** Props for {@link ConfirmDeleteDialog}. */
export interface ConfirmDeleteDialogProps {
  /** Whether the dialog is visible. */
  open: boolean
  /** Display name of the entity being deleted, shown for context. */
  entityName?: string
  /** When true, shows a destructive warning about child elements being deleted. */
  hasChildren?: boolean
  /** Custom warning text when `hasChildren` is true. Falls back to the default i18n string. */
  childrenWarning?: string
  /** Whether the delete mutation is in progress. */
  isPending: boolean
  /** Called when the user confirms deletion. */
  onConfirm: () => void
  /** Called when the user cancels. */
  onCancel: () => void
}

/**
 * Generic delete confirmation dialog for planning-object entities.
 *
 * Shows an optional destructive warning block when the entity has children.
 * The confirm button shows a spinner while `isPending` is true.
 *
 * @param props - Component props.
 * @returns The rendered delete confirmation dialog.
 */
export function ConfirmDeleteDialog({
  open,
  hasChildren = false,
  childrenWarning,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
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
          <DialogTitle>{t('features.planningObjects.common.deleteTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-muted-foreground text-sm">
            {t('features.planningObjects.common.deleteDescription')}
          </p>
          {hasChildren && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive mt-3 rounded-md border p-3 text-sm">
              {childrenWarning ?? t('features.planningObjects.common.deleteHasChildren')}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('features.planningObjects.common.deleteCancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && (
              <Loader2
                className="mr-1.5 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {t('features.planningObjects.common.deleteConfirmAction')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
