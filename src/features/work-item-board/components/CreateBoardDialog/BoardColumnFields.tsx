import type { Control, FieldArrayWithId, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Badge, FormControl, FormField, FormItem, FormMessage, Input } from '@/shared/components'

import type { BoardFormValues } from '../../utils/boardFormSchema'

interface BoardColumnFieldsProps {
  fields: FieldArrayWithId<BoardFormValues, 'columns'>[]
  control: Control<BoardFormValues>
  isPending: boolean
  errors: FieldErrors<BoardFormValues>
}

/**
 * Renders the editable column name fields for each default board column.
 * @param root0 - Component props.
 * @param root0.fields - Field array entries from react-hook-form.
 * @param root0.control - Form control from react-hook-form.
 * @param root0.isPending - Whether a mutation is in flight (disables inputs).
 * @param root0.errors - Field errors from react-hook-form.
 * @returns A list of column name inputs with their status badge.
 */
export function BoardColumnFields({ fields, control, isPending }: BoardColumnFieldsProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {t('features.workItem.board.defaultColumns', 'Default Columns')}
      </p>
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`columns.${index}.name`}
          render={({ field: inputField }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    {...inputField}
                    disabled={isPending}
                  />
                </FormControl>
                <Badge variant="secondary">{field.workItemStatus}</Badge>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  )
}
