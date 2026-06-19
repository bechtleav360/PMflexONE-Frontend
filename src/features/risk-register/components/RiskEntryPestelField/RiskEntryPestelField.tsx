import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Combobox, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

/** Props for {@link RiskEntryPestelField}. */
interface RiskEntryPestelFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Current PESTEL category value, or `null` when unset. */
  value: string | null
  /** Called when the selection changes. */
  onChange: (v: string | null) => void
  /** Translated PESTEL category options. */
  options: { value: string; label: string }[]
  /** Validation error for the PESTEL category field. */
  error?: FieldError
}

/**
 * Labelled combobox for the PESTEL category field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.value - Current PESTEL category value, or `null` when unset.
 * @param props.onChange - Called when the selection changes.
 * @param props.options - Translated PESTEL category options.
 * @param props.error - Validation error for the PESTEL category field.
 * @returns The labelled PESTEL combobox with optional inline error.
 */
export function RiskEntryPestelField({
  idPrefix,
  value,
  onChange,
  options,
  error,
}: RiskEntryPestelFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-pestel`}>
        {t('pages.riskManagement.createRiskEntry.fields.pestelCategory')}
        <span
          className="text-destructive ml-0.5"
          aria-hidden="true"
        >
          {REQUIRED_MARKER}
        </span>
      </Label>
      <Combobox
        id={`${idPrefix}-pestel`}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={t('pages.riskManagement.createRiskEntry.fields.pestelPlaceholder')}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-pestel-error` : undefined}
      />
      {error && (
        <p
          id={`${idPrefix}-pestel-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.riskManagement.validation.pestelRequired')}
        </p>
      )}
    </div>
  )
}
