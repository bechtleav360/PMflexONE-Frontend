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
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { deleteWithToast, useDeleteProject } from '../hooks/useDeleteProject'
import { useDeleteProjectStore } from '../store/deleteProjectStore'

/**
 * Confirmation dialog for deleting a project.
 *
 * Open/close state and the project ID are managed by `useDeleteProjectStore`
 * (Zustand). The consuming page calls `openModal(projectId)` to open the
 * dialog; the user then confirms or cancels.
 *
 * On confirm: dispatches the `deleteProject` mutation wrapped in a promise
 * toast, closes the dialog on success, and refreshes the projects list.
 *
 * @returns A shadcn `Dialog` with destructive confirm and cancel actions.
 */
export function DeleteProjectDialog() {
  const { t } = useTranslation()
  const open = useDeleteProjectStore((s) => s.open)
  const payload = useDeleteProjectStore((s) => s.payload)
  const closeModal = useDeleteProjectStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useDeleteProject()

  function handleConfirm() {
    if (!payload) return
    deleteWithToast(mutateAsync, payload, {
      loading: t('features.deleteProject.toast.loading'),
      success: t('features.deleteProject.toast.success'),
      error: (err) => getGraphQLErrorMessage(err, t('features.deleteProject.toast.error')),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('features.deleteProject.dialog.title')}</DialogTitle>
          <DialogDescription>{t('features.deleteProject.dialog.description')}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={closeModal}
          >
            {t('features.deleteProject.dialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleConfirm}
          >
            {t('features.deleteProject.dialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
