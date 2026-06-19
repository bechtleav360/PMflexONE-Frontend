import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DatePicker, Label } from '@/shared/components'

/** Props for {@link RiskEntryIdentificationDateField}. */
interface RiskEntryIdentificationDateFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** The currently selected date, or `null` when unset. */
  value: Date | null
  /** Called when the date selection changes. */
  onChange: (date: Date | null | undefined) => void
  /** Validation error for the identification date field. */
  error?: FieldError
}

/**
 * Labelled date picker for the risk entry identification date field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.value - The currently selected date, or `null` when unset.
 * @param props.onChange - Called when the date selection changes.
 * @param props.error - Validation error for the identification date field.
 * @returns The labelled date picker with optional inline error.
 */
export function RiskEntryIdentificationDateField({
  idPrefix,
  value,
  onChange,
  error,
}: RiskEntryIdentificationDateFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-date`}>
        {t('pages.riskManagement.createRiskEntry.fields.identificationDate')}
      </Label>
      <DatePicker
        id={`${idPrefix}-date`}
        value={value}
        onChange={onChange}
        className="relative"
        calendarClassName="absolute top-full left-0 z-50 mt-1 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md"
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-date-error` : undefined}
      />
      {error && (
        <p
          id={`${idPrefix}-date-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.riskManagement.validation.dateInvalid')}
        </p>
      )}
    </div>
  )
}
