import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  DatePicker,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectFormValues } from '../../types/projectForm.types'

const CALENDAR_BASE =
  'absolute top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md'

interface ProjectDateRangeFieldsProps {
  /** RHF control wired to a project form. */
  control: Control<ProjectFormValues>
  /** Mirrors the mutation pending state to disable both pickers. */
  isPending: boolean
  /** i18n keys for all translatable strings in these fields. */
  i18nKeys: {
    startDateLabel: string
    endDateLabel: string
  }
}

/**
 * Renders the Start Date and End Date pickers side by side in a two-column grid.
 *
 * Shared by `CreateProjectForm` and `EditProjectForm`. Each calendar opens as
 * a floating overlay so it does not shift the form layout. All translatable
 * strings are injected via `i18nKeys` so each feature can use its own scope.
 *
 * @param props - Component props.
 * @param props.control - React Hook Form control instance.
 * @param props.isPending - When `true`, both pickers are disabled.
 * @param props.i18nKeys - Resolved translation strings for field labels.
 * @returns The two-column date range row.
 */
export function ProjectDateRangeFields({
  control,
  isPending,
  i18nKeys,
}: ProjectDateRangeFieldsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(i18nKeys.startDateLabel)}
              <span
                className="text-destructive ml-0.5"
                aria-hidden="true"
              >
                {REQUIRED_MARKER}
              </span>
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ?? null}
                onChange={(date) => field.onChange(date ?? undefined)}
                disabled={isPending}
                aria-required="true"
                className="relative"
                calendarClassName={`${CALENDAR_BASE} left-0`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="endDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t(i18nKeys.endDateLabel)}
              <span
                className="text-destructive ml-0.5"
                aria-hidden="true"
              >
                {REQUIRED_MARKER}
              </span>
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ?? null}
                onChange={(date) => field.onChange(date ?? undefined)}
                disabled={isPending}
                aria-required="true"
                className="relative"
                calendarClassName={`${CALENDAR_BASE} right-0`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
