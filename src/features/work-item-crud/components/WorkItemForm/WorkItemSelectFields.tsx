import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useLabels, usePersons } from '@/entities/work-item'
import {
  Combobox,
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
import type { ScopeType } from '@/shared/types/scopeType'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'
import { LabelToggleField } from './LabelToggleField'
import { StatusField } from './StatusField'

interface WorkItemSelectFieldsProps {
  /** react-hook-form control instance. */
  control: Control<WorkItemFormValues>
  /** Whether a mutation is in flight. */
  isPending: boolean
  /** When true the status field is rendered. */
  showStatus: boolean
  /** When true the status select is disabled. */
  disableStatus: boolean
  /** Scope for loading labels. Labels field hidden when not provided. */
  scopeType?: ScopeType
  /** Scope for loading labels. Labels field hidden when not provided. */
  scopeId?: string
}

/**
 * Priority and optional status select fields for the work item form.
 * @param root0 - Component props.
 * @param root0.control - react-hook-form control instance.
 * @param root0.isPending - Whether a mutation is in flight.
 * @param root0.showStatus - When true the status field is rendered.
 * @param root0.disableStatus - When true the status select is disabled.
 * @param root0.scopeType - Scope entity type for loading available labels.
 * @param root0.scopeId - Scope entity ID for loading available labels.
 * @returns Priority, assignee, status, and labels form fields.
 */
export function WorkItemSelectFields({
  control,
  isPending,
  showStatus,
  disableStatus,
  scopeType,
  scopeId,
}: WorkItemSelectFieldsProps) {
  const { t } = useTranslation()
  const { data: availableLabels = [] } = useLabels(scopeType ?? 'Project', scopeId ?? '')
  const { data: persons = [] } = usePersons()

  return (
    <>
      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.workItem.form.priority', 'Priority')}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ''}
              disabled={isPending}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('features.workItem.form.priorityPlaceholder', 'Select priority')}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="LOW">{t('entities.workItem.priority.LOW', 'Low')}</SelectItem>
                <SelectItem value="MEDIUM">
                  {t('entities.workItem.priority.MEDIUM', 'Medium')}
                </SelectItem>
                <SelectItem value="HIGH">{t('entities.workItem.priority.HIGH', 'High')}</SelectItem>
                <SelectItem value="VERY_HIGH">
                  {t('entities.workItem.priority.VERY_HIGH', 'Very High')}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="assigneeId"
        render={({ field }) => {
          const NONE = '__none__'
          const options = [
            { value: NONE, label: t('features.workItem.form.assigneeNone', 'No assignee') },
            ...persons.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}` })),
          ]
          return (
            <FormItem>
              <FormLabel>{t('features.workItem.form.assignee', 'Assignee')}</FormLabel>
              <FormControl>
                <Combobox
                  options={options}
                  value={field.value ?? NONE}
                  onChange={(v) => field.onChange(v === NONE || v === null ? null : v)}
                  placeholder={t('features.workItem.form.assigneePlaceholder', 'Select assignee')}
                  searchPlaceholder={t('shared.combobox.searchPlaceholder', 'Search…')}
                  noResultsText={t('shared.combobox.noResults', 'No results found.')}
                  disabled={isPending}
                  listClassName="max-h-[10rem]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {showStatus && (
        <StatusField
          control={control}
          isPending={isPending}
          disableStatus={disableStatus}
        />
      )}

      {availableLabels.length > 0 && (
        <LabelToggleField
          control={control}
          isPending={isPending}
          availableLabels={availableLabels}
        />
      )}
    </>
  )
}
