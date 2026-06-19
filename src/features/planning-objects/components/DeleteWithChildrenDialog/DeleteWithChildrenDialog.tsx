import { Loader2, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/Dialog'

/** Props for the DeleteWithChildrenDialog component. */
interface DeleteWithChildrenDialogProps {
  /** Controls dialog open state. */
  isOpen: boolean
  /** Called with `true` for cascade delete, `false` for single delete. */
  onConfirm: (cascade: boolean) => void
  /** Called when the user dismisses the dialog without confirming. */
  onCancel: () => void
  /** When true, buttons are disabled and the confirm button shows a spinner. */
  isPending: boolean
  /** Number of children, shown in description text. */
  childCount?: number
}

const DESCRIPTION_ID = 'delete-with-children-description'

/**
 * Alert dialog that warns the user before deleting a goal that has child goals.
 * Supports cascade deletion via the "Delete all" action.
 * WCAG: role=alertdialog, aria-describedby wired to the description paragraph.
 * @param props - Component props.
 * @param props.isOpen - Controls dialog open state.
 * @param props.onConfirm - Called with `true` for cascade delete.
 * @param props.onCancel - Called when the user dismisses the dialog.
 * @param props.isPending - When true, buttons are disabled and spinner shown.
 * @param props.childCount - Number of children shown in description text.
 * @returns The rendered alert dialog.
 */
function DeleteWithChildrenDialog({
  isOpen,
  onConfirm,
  onCancel,
  isPending,
  childCount,
}: DeleteWithChildrenDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent
        role="alertdialog"
        aria-describedby={DESCRIPTION_ID}
      >
        <DialogHeader>
          <DialogTitle>{t('features.planningObjects.goals.deleteDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="px-dialog-x py-lg flex flex-col gap-3">
          <p
            id={DESCRIPTION_ID}
            className="text-muted-foreground text-[13px]"
          >
            {typeof childCount === 'number'
              ? t('features.planningObjects.goals.deleteDialog.descriptionWithCount', {
                  count: childCount,
                })
              : t('features.planningObjects.goals.deleteDialog.description')}
          </p>
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-[13px]">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>{t('features.planningObjects.goals.deleteDialog.cascadeWarning')}</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('features.planningObjects.goals.deleteDialog.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(true)}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending && (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {t('features.planningObjects.goals.deleteDialog.deleteAll')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

DeleteWithChildrenDialog.displayName = 'DeleteWithChildrenDialog'

export { DeleteWithChildrenDialog }
export type { DeleteWithChildrenDialogProps }
