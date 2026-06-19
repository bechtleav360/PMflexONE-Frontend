import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  showPromise,
} from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useDeletePortfolio } from '../hooks/useDeletePortfolio'
import { useDeletePortfolioDialogStore } from '../store/useDeletePortfolioDialogStore'

/**
 * Confirmation dialog for deleting a portfolio.
 * Open/close state and the selected portfolio are managed by the delete-portfolio dialog store.
 *
 * @returns The rendered confirmation dialog.
 */
export function DeletePortfolioDialog() {
  const { t } = useTranslation()
  const { isOpen, portfolio, close } = useDeletePortfolioDialogStore()
  const { mutateAsync } = useDeletePortfolio()

  function handleConfirm() {
    if (portfolio === null) return
    close()
    showPromise(mutateAsync(portfolio.id), {
      loading: t('pages.portfolios.deleteDialog.toast.deleting'),
      success: t('pages.portfolios.deleteDialog.toast.success'),
      error: (err) => getGraphQLErrorMessage(err, t('pages.portfolios.deleteDialog.toast.error')),
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages.portfolios.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.portfolios.deleteDialog.description', { name: portfolio?.name ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
          >
            {t('pages.portfolios.deleteDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
          >
            {t('pages.portfolios.deleteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
