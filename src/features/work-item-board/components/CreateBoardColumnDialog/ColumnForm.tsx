import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import { BASE_STATUSES } from '../../utils/boardFormSchema'

/** Validated values for the create-column form. */
export type ColumnFormValues = {
  name: string
  workItemStatus: (typeof BASE_STATUSES)[number]
}

/** Props for the ColumnForm component. */
interface ColumnFormProps {
  form: UseFormReturn<ColumnFormValues>
  isPending: boolean
  onClose: () => void
  onSubmit: (values: ColumnFormValues) => Promise<void>
}

/**
 * Form for creating a new board column, including name and status fields.
 * @param root0 - The component props.
 * @param root0.form - The react-hook-form instance.
 * @param root0.isPending - Whether a submission is in progress.
 * @param root0.onClose - Callback to close the dialog.
 * @param root0.onSubmit - Async handler called with validated form values.
 * @returns The rendered column creation form.
 */
export function ColumnForm({ form, isPending, onClose, onSubmit }: ColumnFormProps) {
  const { t } = useTranslation()

  return (
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
              <FormLabel>{t('features.workItem.board.columnName', 'Column name')}</FormLabel>
              <FormControl>
                {/* eslint-disable jsx-a11y/no-autofocus -- intentional: dialog auto-focuses the name field on open; block form required because Prettier splits <Input> props across lines */}
                <Input
                  {...field}
                  disabled={isPending}
                  autoFocus
                />
                {/* eslint-enable jsx-a11y/no-autofocus */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workItemStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('features.workItem.board.columnStatus', 'Status')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BASE_STATUSES.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                    >
                      {t(`features.workItem.status.${status}`, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {t('features.workItem.form.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {t('features.workItem.board.addColumn', 'Add')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
