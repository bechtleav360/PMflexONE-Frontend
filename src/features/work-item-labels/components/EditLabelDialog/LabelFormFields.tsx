import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  ColorPicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components'

import type { LabelFormValues } from '../../utils/labelFormSchema'

/** Props for the LabelFormFields component. */
export interface LabelFormFieldsProps {
  form: UseFormReturn<LabelFormValues>
  isPending: boolean
  onCancel: () => void
  onSubmit: (values: LabelFormValues) => Promise<void>
}

/**
 * Form fields for creating or editing a label (name + color).
 * @param props - See LabelFormFieldsProps.
 * @returns The form fields element.
 */
export function LabelFormFields({ form, isPending, onCancel, onSubmit }: LabelFormFieldsProps) {
  const { t } = useTranslation()
  return (
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
          onClick={onCancel}
        >
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {isPending ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
        </Button>
      </div>
    </form>
  )
}
