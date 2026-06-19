import { useTranslation } from 'react-i18next'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'

import { useEditProjectStore } from '../store/editProjectStore'
import { EditProjectForm } from './EditProjectForm'

/**
 * Modal dialog for editing an existing project.
 *
 * Open/close state and the project being edited are managed by
 * `useEditProjectStore` (Zustand). The modal is triggered from the edit
 * button on the `ProjectsPage` table row.
 *
 * Renders `EditProjectForm` as the dialog body. On successful submission
 * the form closes the modal and the project list refreshes automatically.
 *
 * @returns A shadcn `Dialog` wrapping the edit-project form.
 */
export function EditProjectModal() {
  const { t } = useTranslation()
  const open = useEditProjectStore((s) => s.open)
  const closeModal = useEditProjectStore((s) => s.closeModal)

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent
        size="lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.editProject.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EditProjectForm onCancel={closeModal} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
