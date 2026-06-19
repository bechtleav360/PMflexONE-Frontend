import { useTranslation } from 'react-i18next'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'

import { useCreateProjectStore } from '../store/createProjectStore'
import { CreateProjectForm } from './CreateProjectForm'

/**
 * Modal dialog for creating a new project.
 *
 * Open/close state is managed by `useCreateProjectStore` (Zustand). The
 * modal can be triggered from any page — the trigger button in `Layout.tsx`
 * and the "New Project" button on `ProjectsPage` both call `openModal()`.
 *
 * Renders `CreateProjectForm` as the dialog body. On successful submission
 * the form closes the modal and navigates to `/projects`.
 *
 * @returns A shadcn `Dialog` wrapping the create-project form.
 */
export function CreateProjectModal() {
  const { t } = useTranslation()
  const open = useCreateProjectStore((s) => s.open)
  const closeModal = useCreateProjectStore((s) => s.closeModal)

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        /* v8 ignore next */
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent
        size="lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.createProject.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CreateProjectForm onCancel={closeModal} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
