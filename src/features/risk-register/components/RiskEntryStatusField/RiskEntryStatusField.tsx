import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Combobox, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

/** Props for {@link RiskEntryStatusField}. */
interface RiskEntryStatusFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Current status value. */
  value: string | null
  /** Called when the selection changes. */
  onChange: (v: string | null) => void
  /** Translated status options. */
  options: { value: string; label: string }[]
  /** Validation error for the status field. */
  error?: FieldError
  /** Whether the status options are still loading. */
  loading?: boolean
  /** Whether the field is disabled (e.g. when the status is irreversible). */
  disabled?: boolean
}

/**
 * Labelled combobox for the risk entry status field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.value - Current status value.
 * @param props.onChange - Called when the selection changes.
 * @param props.options - Translated status options.
 * @param props.error - Validation error for the status field.
 * @param props.loading - Whether the status options are still loading.
 * @param props.disabled - Whether the field is disabled.
 * @returns The labelled status combobox with optional inline error.
 */
export function RiskEntryStatusField({
  idPrefix,
  value,
  onChange,
  options,
  error,
  loading,
  disabled,
}: RiskEntryStatusFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-status`}>
        {t('pages.riskManagement.createRiskEntry.fields.status')}
        <span
          className="text-destructive ml-0.5"
          aria-hidden="true"
        >
          {REQUIRED_MARKER}
        </span>
      </Label>
      <Combobox
        id={`${idPrefix}-status`}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={t('pages.riskManagement.createRiskEntry.fields.statusPlaceholder')}
        loading={loading}
        disabled={disabled}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-status-error` : undefined}
      />
      {error && (
        <p
          id={`${idPrefix}-status-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.riskManagement.validation.statusRequired')}
        </p>
      )}
    </div>
  )
}
