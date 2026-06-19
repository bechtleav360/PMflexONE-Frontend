import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components'

import { FeedbackDeleteDialog } from './FeedbackDeleteDialog'
import { FeedbackFormDialog } from './FeedbackFormDialog'
import { ShowcaseSection } from './ShowcaseSection'

/**
 * Dialog showcase for FeedbackSection.
 * @returns A ShowcaseSection with delete, form, and simple confirmation dialog examples.
 */
export function FeedbackSectionDialogs() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.dialog.title')}>
      <FeedbackDeleteDialog />
      <FeedbackFormDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{t('showcase.dialog.openConfirmDialog')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('showcase.dialog.simpleConfirmTitle')}</DialogTitle>
            <DialogDescription>{t('showcase.dialog.simpleConfirmText')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost">{t('showcase.dialog.cancel')}</Button>
            <Button variant="destructive">{t('showcase.dialog.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShowcaseSection>
  )
}
