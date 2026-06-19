import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useEditPortfolioDialogStore } from '../store/useEditPortfolioDialogStore'
import { EditPortfolioForm } from './EditPortfolioForm'

/**
 * Dialog that wraps the portfolio edit form.
 * Open/close state and the selected portfolio are managed by the edit-portfolio dialog store.
 *
 * @returns The rendered dialog with the edit form inside, or null when no portfolio is selected.
 */
export function EditPortfolioDialog() {
  const { t } = useTranslation()
  const { isOpen, portfolio, close } = useEditPortfolioDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages.portfolios.editForm.title')}</DialogTitle>
          <DialogDescription>{t('pages.portfolios.editForm.description')}</DialogDescription>
        </DialogHeader>
        {portfolio !== null && (
          <DialogBody>
            <EditPortfolioForm portfolio={portfolio} />
          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  )
}
