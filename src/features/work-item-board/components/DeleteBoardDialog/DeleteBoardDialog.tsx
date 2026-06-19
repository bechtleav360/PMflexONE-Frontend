import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useDeleteBoard } from '../../hooks/useDeleteBoard'

interface DeleteBoardDialogProps {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

/**
 * Confirmation dialog for deleting a board. Tasks are moved to the active pool by the backend — not deleted.
 * @param root0 - Component props.
 * @param root0.boardId - ID of the board to delete.
 * @param root0.open - Whether the dialog is visible.
 * @param root0.onOpenChange - Called when the dialog open state changes.
 * @param root0.onDeleted - Called after the board has been successfully deleted.
 * @returns The delete-board confirmation dialog.
 */
export function DeleteBoardDialog({
  boardId,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBoardDialogProps) {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useDeleteBoard()

  async function handleConfirm() {
    try {
      await mutateAsync(boardId)
      onOpenChange(false)
      onDeleted()
    } catch {
      // onError in hook handles user-facing feedback
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {t('features.workItem.board.deleteBoardTitle', 'Delete board?')}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <p className="text-muted-foreground text-sm">
            {t(
              'features.workItem.board.deleteBoardMessage',
              'This action cannot be undone. Tasks will be moved to the active pool.',
            )}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? t('common.deleting', 'Deleting…') : t('common.delete', 'Delete')}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
