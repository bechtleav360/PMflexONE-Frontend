import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  ColorPicker,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components'
import { FALLBACK_LABEL_COLOR } from '@/shared/components/LabelBadge'
import type { ScopeType } from '@/shared/types/scopeType'

import { useCreateLabel } from '../../hooks/useCreateLabel'
import { useCreateLabelDialogStore } from '../../store/labelDialogStores'
import { labelFormSchema, type LabelFormValues } from '../../utils/labelFormSchema'

interface CreateLabelDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Dialog for creating a new label with a name and ARGB color picker.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope type (e.g. 'Project').
 * @param root0.scopeId - The ID of the scope.
 * @returns The create label dialog element.
 */
export function CreateLabelDialog({ scopeType, scopeId }: CreateLabelDialogProps) {
  const { t } = useTranslation()
  const open = useCreateLabelDialogStore((s) => s.open)
  const closeModal = useCreateLabelDialogStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useCreateLabel(scopeType, scopeId)
  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: { name: '', color: FALLBACK_LABEL_COLOR },
  })

  async function onSubmit(values: LabelFormValues) {
    try {
      await mutateAsync({ scopeId, scopeType, ...values })
      closeModal()
      form.reset()
    } catch {
      /* onError in hook handles user-facing feedback */
    }
  }
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal()
      form.reset()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {t('features.workItemLabels.createDialog.title', 'Create Label')}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('features.workItemLabels.form.name', 'Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('features.workItemLabels.form.color', 'Color')}</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending
                    ? t('common.saving', 'Saving…')
                    : t('features.workItemLabels.createDialog.submit', 'Create Label')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
