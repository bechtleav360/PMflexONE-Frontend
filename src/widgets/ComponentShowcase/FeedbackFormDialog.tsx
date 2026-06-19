import { useTranslation } from 'react-i18next'

import {
  Button,
  DatePicker,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

/**
 * New project form dialog for the FeedbackSection showcase.
 * @returns A Dialog with a project creation form.
 */
export function FeedbackFormDialog() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t('showcase.dialog.openFormDialog')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('showcase.dialog.newProjectTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">{t('showcase.dialog.newProjectNameLabel')}</Label>
            <Input
              id="project-name"
              placeholder={t('showcase.dialog.newProjectNamePlaceholder')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-size">{t('showcase.dialog.newProjectSizeLabel')}</Label>
            <Select>
              <SelectTrigger id="project-size">
                <SelectValue placeholder={t('showcase.dialog.newProjectSizePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t('showcase.dialog.newProjectSizeSmall')}</SelectItem>
                <SelectItem value="medium">{t('showcase.dialog.newProjectSizeMedium')}</SelectItem>
                <SelectItem value="large">{t('showcase.dialog.newProjectSizeLarge')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t('showcase.dialog.newProjectStartLabel')}</Label>
              <DatePicker />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('showcase.dialog.newProjectEndLabel')}</Label>
              <DatePicker />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-desc">{t('showcase.dialog.newProjectDescLabel')}</Label>
            <Input
              id="project-desc"
              placeholder={t('showcase.dialog.newProjectDescPlaceholder')}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost">{t('showcase.dialog.cancel')}</Button>
          <Button>{t('showcase.dialog.createProject')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
