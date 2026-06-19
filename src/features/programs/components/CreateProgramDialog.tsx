import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useCreateProgramDialogStore } from '../store/useCreateProgramDialogStore'
import { CreateProgramForm } from './CreateProgramForm'

/**
 * Modal dialog that wraps {@link CreateProgramForm}.
 *
 * Opens and closes via {@link useCreateProgramDialogStore}. Mount once per
 * page near the root of the component tree.
 *
 * @returns The rendered dialog element.
 */
export function CreateProgramDialog() {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateProgramDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{t('pages.programs.createDialog.title')}</DialogTitle>
          <DialogDescription>{t('pages.programs.createDialog.description')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreateProgramForm />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
