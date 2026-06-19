import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { Label } from '@/entities/work-item'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components'
import { argbToInlineColor } from '@/shared/utils/colorUtils'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'

/** Props for the LabelToggleField component. */
export interface LabelToggleFieldProps {
  control: Control<WorkItemFormValues>
  isPending: boolean
  availableLabels: Label[]
}

/**
 * Toggle-button group for selecting work item labels.
 * @param root0 - Component props.
 * @param root0.control - react-hook-form control instance.
 * @param root0.isPending - Whether a mutation is in flight.
 * @param root0.availableLabels - Labels available for selection.
 * @returns The labels form field element.
 */
export function LabelToggleField({ control, isPending, availableLabels }: LabelToggleFieldProps) {
  const { t } = useTranslation()
  return (
    <FormField
      control={control}
      name="labelIds"
      render={({ field }) => {
        const selected: string[] = field.value ?? []
        function toggle(id: string) {
          field.onChange(
            selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id],
          )
        }
        return (
          <FormItem>
            <FormLabel>{t('features.workItem.form.labels', 'Labels')}</FormLabel>
            <FormControl>
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label={t('features.workItem.form.labels', 'Labels')}
              >
                {availableLabels.map((label) => {
                  const active = selected.includes(label.id)
                  return (
                    <button
                      key={label.id}
                      type="button"
                      disabled={isPending}
                      onClick={() => toggle(label.id)}
                      aria-pressed={active ? 'true' : 'false'}
                      className={`focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                    >
                      {label.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: argbToInlineColor(label.color) }}
                        />
                      )}
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
