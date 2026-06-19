import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Combobox, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

/** Props for {@link RiskEntryTypeField}. */
interface RiskEntryTypeFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Current selected type value. */
  value: string | null
  /** Called when the selection changes. */
  onChange: (v: string | null) => void
  /** Translated type options. */
  options: { value: string; label: string }[]
  /** Validation error for the type field. */
  error?: FieldError
  /** Whether the field is disabled. */
  disabled?: boolean
}

/**
 * Labelled combobox for the risk/opportunity type field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.value - Current selected type value.
 * @param props.onChange - Called when the selection changes.
 * @param props.options - Translated type options.
 * @param props.error - Validation error for the type field.
 * @param props.disabled - Whether the field is disabled.
 * @returns The labelled type combobox with optional inline error.
 */
export function RiskEntryTypeField({
  idPrefix,
  value,
  onChange,
  options,
  error,
  disabled,
}: RiskEntryTypeFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-type`}>
        {t('pages.riskManagement.createRiskEntry.fields.type')}
        <span
          className="text-destructive ml-0.5"
          aria-hidden="true"
        >
          {REQUIRED_MARKER}
        </span>
      </Label>
      <Combobox
        id={`${idPrefix}-type`}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={t('pages.riskManagement.createRiskEntry.fields.typePlaceholder')}
        disabled={disabled}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-type-error` : undefined}
      />
      {error && (
        <p
          id={`${idPrefix}-type-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.riskManagement.validation.typeRequired')}
        </p>
      )}
    </div>
  )
}
