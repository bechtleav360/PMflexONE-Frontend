import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { DatePicker, formatLocalDate, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'

interface PirDateFieldProps {
  id: string
  label: string
  fieldName: 'requestDate' | 'targetDeliveryDate'
  control: Control<ProjectInitiationRequestFormValues>
  errorMessage?: string
  disabled: boolean
  required?: boolean
  isView?: boolean
}

/**
 * Controlled date field for the PIR form, wrapping a `DatePicker` with an
 * accessible label and inline error message.
 *
 * @param props - Component props.
 * @param props.id - HTML `id` for the `DatePicker` trigger, paired with the `Label`.
 * @param props.label - Visible label text.
 * @param props.fieldName - RHF field name — `'requestDate'` or `'targetDeliveryDate'`.
 * @param props.control - RHF control object.
 * @param props.errorMessage - Validation error text rendered below the field.
 * @param props.disabled - When true the picker is non-interactive.
 * @param props.required - When true, shows a required-field asterisk (hidden in view mode).
 * @param props.isView - When true suppresses the required marker.
 * @returns A labelled date picker with optional inline error.
 */
export function PirDateField({
  id,
  label,
  fieldName,
  control,
  errorMessage,
  disabled,
  required = false,
  isView = false,
}: PirDateFieldProps) {
  const errorId = errorMessage ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required && !isView && (
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        )}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <DatePicker
            id={id}
            value={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date ? formatLocalDate(date) : null)}
            disabled={disabled}
            aria-invalid={errorMessage !== undefined}
            aria-describedby={errorId}
            aria-required={required && !isView ? 'true' : undefined}
            className="relative"
            calendarClassName="absolute top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md left-0"
          />
        )}
      />
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-sm"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
