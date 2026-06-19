import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import { showError, showSuccess } from '@/shared/components/Toast/toastApi'

import { useDeleteDeliverable } from '../../hooks/useDeleteDeliverable'
import { useDeliverableTree } from '../../hooks/useDeliverables'
import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'
import { getDeliverableDescendants } from '../../utils/getDeliverableDescendants'

interface DeleteDeliverableDialogProps {
  projectId: string
}

/**
 * Confirmation dialog for deleting a deliverable.
 *
 * When the deliverable has child nodes, shows a cascade warning with the
 * total descendant count. Calls `deleteDeliverable` mutation on confirm.
 *
 * @param props - Component props.
 * @param props.projectId - Used to invalidate the correct cache on success.
 * @returns The rendered delete confirmation dialog.
 */
export function DeleteDeliverableDialog({ projectId }: DeleteDeliverableDialogProps) {
  const { t } = useTranslation()

  const deleteDialog = useDeliverablesUiStore((s) => s.deleteDialog)
  const closeDeleteDialog = useDeliverablesUiStore((s) => s.closeDeleteDialog)

  const { data: treeData } = useDeliverableTree(projectId)
  const tree = treeData?.tree ?? []

  const deleteMutation = useDeleteDeliverable(projectId)

  const deliverableId = deleteDialog.deliverableId
  const version = deleteDialog.version

  const descendantCount = deliverableId ? getDeliverableDescendants(deliverableId, tree).size : 0

  async function handleConfirm() {
    if (!deliverableId || version === null) return
    try {
      const result = await deleteMutation.mutateAsync({ id: deliverableId, version })
      const totalDeleted = result.deletedDescendantCount
      if (totalDeleted > 0) {
        showSuccess(
          t('features.deliverablesManagement.toast.deletedWithChildren', {
            count: totalDeleted,
          }),
        )
      } else {
        showSuccess(t('features.deliverablesManagement.toast.deleted'))
      }
      closeDeleteDialog()
    } catch {
      showError(t('features.deliverablesManagement.toast.deleteFailed'))
    }
  }

  return (
    <Dialog
      open={deleteDialog.open}
      onOpenChange={(open) => {
        if (!open) closeDeleteDialog()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('features.deliverablesManagement.delete.title')}</DialogTitle>
          <DialogDescription>
            {t('features.deliverablesManagement.delete.description')}
          </DialogDescription>
        </DialogHeader>

        {descendantCount > 0 && (
          <DialogBody>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('features.deliverablesManagement.delete.cascadeWarning')}
              </AlertDescription>
            </Alert>
          </DialogBody>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteDialog}
            disabled={deleteMutation.isPending}
          >
            {t('features.deliverablesManagement.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {descendantCount > 0
              ? t('features.deliverablesManagement.actions.deleteAll')
              : t('features.deliverablesManagement.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
