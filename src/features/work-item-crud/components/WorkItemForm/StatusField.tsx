import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'

/** Props for the StatusField component. */
export interface StatusFieldProps {
  control: Control<WorkItemFormValues>
  isPending: boolean
  disableStatus: boolean
}

/**
 * Work item status select field for the work item form.
 * @param root0 - Component props.
 * @param root0.control - react-hook-form control instance.
 * @param root0.isPending - Whether a mutation is in flight.
 * @param root0.disableStatus - When true the select is disabled.
 * @returns The status form field element.
 */
export function StatusField({ control, isPending, disableStatus }: StatusFieldProps) {
  const { t } = useTranslation()
  return (
    <FormField
      control={control}
      name={'status' as keyof WorkItemFormValues}
      render={({ field }) => {
        const currentStatus = (field.value as string) ?? ''
        return (
          <FormItem>
            <FormLabel aria-label={t('features.workItem.form.status', 'Status')}>
              {t('features.workItem.form.status', 'Status')}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={currentStatus}
              disabled={isPending || disableStatus}
            >
              <FormControl>
                <SelectTrigger aria-label={t('features.workItem.form.status', 'Status')}>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="open">{t('entities.workItem.status.open', 'Open')}</SelectItem>
                <SelectItem value="in_progress">
                  {t('entities.workItem.status.in_progress', 'In Progress')}
                </SelectItem>
                <SelectItem value="done">{t('entities.workItem.status.done', 'Done')}</SelectItem>
                {currentStatus === 'rejected' && (
                  <SelectItem
                    value="rejected"
                    disabled
                  >
                    {t('entities.workItem.status.rejected', 'Rejected')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
