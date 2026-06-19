import { AlertCircle, Trash2 } from 'lucide-react'
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
  DialogTrigger,
  Input,
  Label,
} from '@/shared/components'

/**
 * Delete confirmation dialog for the FeedbackSection showcase.
 * @returns A Dialog with a destructive delete confirmation flow.
 */
export function FeedbackDeleteDialog() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
          {t('showcase.dialog.openDeleteDialog')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('showcase.dialog.deleteProjectTitle')}</DialogTitle>
          <DialogDescription>{t('showcase.dialog.deleteProjectDesc')}</DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('showcase.dialog.deleteProjectAlertText')}</AlertDescription>
          </Alert>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-delete">{t('showcase.dialog.deleteProjectConfirmLabel')}</Label>
            <Input
              id="confirm-delete"
              placeholder={t('showcase.dialog.deleteProjectConfirmPlaceholder')}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost">{t('showcase.dialog.cancel')}</Button>
          <Button variant="destructive">{t('showcase.dialog.confirmPermanentDelete')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
