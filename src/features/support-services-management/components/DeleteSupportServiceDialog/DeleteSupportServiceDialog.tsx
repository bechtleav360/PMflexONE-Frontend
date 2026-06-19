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

import { useDeleteSupportService } from '../../hooks/useDeleteSupportService'
import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'

interface DeleteSupportServiceDialogProps {
  projectId: string
}

/**
 * Confirmation dialog for deleting a support service.
 *
 * Two variants:
 * - **No children**: Shows simple confirm + "Löschen" button.
 * - **Has children**: Shows cascade warning + "Alle löschen" button.
 *
 * @param props - Component props.
 * @param props.projectId - Used to invalidate the correct cache on success.
 * @returns The rendered delete confirmation dialog.
 */
export function DeleteSupportServiceDialog({ projectId }: DeleteSupportServiceDialogProps) {
  const { t } = useTranslation()

  const deleteDialog = useSupportServicesUiStore((s) => s.deleteDialog)
  const closeDeleteDialog = useSupportServicesUiStore((s) => s.closeDeleteDialog)

  const deleteMutation = useDeleteSupportService(projectId)

  const { supportServiceId, version, hasChildren } = deleteDialog

  async function handleDelete(deleteMode: 'CASCADE_DELETE' | 'PROMOTE_CHILDREN') {
    if (!supportServiceId || version === null) return
    try {
      await deleteMutation.mutateAsync({ id: supportServiceId, version, deleteMode })
      showSuccess(t('features.supportServicesManagement.toast.deleted'))
      closeDeleteDialog()
    } catch {
      showError(t('features.supportServicesManagement.toast.deleteFailed'))
    }
  }

  return (
    <Dialog
      open={deleteDialog.open}
      onOpenChange={(open) => {
        if (!open && !deleteMutation.isPending) closeDeleteDialog()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('features.supportServicesManagement.delete.title')}</DialogTitle>
          <DialogDescription>
            {t('features.supportServicesManagement.delete.description')}
          </DialogDescription>
        </DialogHeader>

        {hasChildren && (
          <DialogBody>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('features.supportServicesManagement.delete.cascadeWarning')}
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
            {t('features.supportServicesManagement.actions.cancel')}
          </Button>

          {hasChildren && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDelete('PROMOTE_CHILDREN')}
              disabled={deleteMutation.isPending}
            >
              {t('features.supportServicesManagement.actions.promoteChildren')}
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete('CASCADE_DELETE')}
            disabled={deleteMutation.isPending}
          >
            {hasChildren
              ? t('features.supportServicesManagement.actions.deleteAll')
              : t('features.supportServicesManagement.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
