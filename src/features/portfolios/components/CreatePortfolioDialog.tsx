import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useCreatePortfolioDialogStore } from '../store/useCreatePortfolioDialogStore'
import { CreatePortfolioForm } from './CreatePortfolioForm'

/**
 * Dialog that wraps the portfolio creation form.
 * Open/close state is managed by the create-portfolio dialog store.
 *
 * @returns The rendered dialog with the creation form inside.
 */
export function CreatePortfolioDialog() {
  const { t } = useTranslation()
  const { isOpen, close } = useCreatePortfolioDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages.portfolios.form.title')}</DialogTitle>
          <DialogDescription>{t('pages.portfolios.form.description')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreatePortfolioForm />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
