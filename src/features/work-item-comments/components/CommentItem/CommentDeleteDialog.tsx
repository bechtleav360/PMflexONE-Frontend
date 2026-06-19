import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

/** Props for the CommentDeleteDialog component. */
export interface CommentDeleteDialogProps {
  open: boolean
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

/**
 * Confirmation dialog for deleting a comment.
 * @param props - See CommentDeleteDialogProps.
 * @returns The delete-confirmation dialog element.
 */
export function CommentDeleteDialog({
  open,
  isDeleting,
  onOpenChange,
  onDelete,
}: CommentDeleteDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('features.workItemComments.deleteDialog.title', 'Delete Comment')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'features.workItemComments.deleteDialog.description',
              'Are you sure you want to delete this comment? This action cannot be undone.',
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('common.deleting', 'Deleting…') : t('common.delete', 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
