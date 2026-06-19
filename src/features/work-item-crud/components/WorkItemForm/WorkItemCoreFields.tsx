import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  DatePicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MarkdownEditor,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'

interface WorkItemCoreFieldsProps {
  control: Control<WorkItemFormValues>
  isPending: boolean
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Name, description, and due-date fields shared by the create and edit work item forms.
 * @param root0 - Component props.
 * @param root0.control - React Hook Form control instance.
 * @param root0.isPending - Whether a mutation is in flight.
 * @returns The three core form fields.
 */
export function WorkItemCoreFields({ control, isPending }: WorkItemCoreFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('features.workItem.form.name', 'Name')}
              <span
                className="text-destructive ml-0.5"
                aria-hidden="true"
              >
                {REQUIRED_MARKER}
              </span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('features.workItem.form.namePlaceholder', 'Enter task name')}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.workItem.form.description', 'Description')}</FormLabel>
            <FormControl>
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder={t(
                  'features.workItem.form.descriptionPlaceholder',
                  'Optional description (Markdown supported)',
                )}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="dueDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.workItem.form.dueDate', 'Due Date')}</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date ? toIsoDate(date) : null)}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
