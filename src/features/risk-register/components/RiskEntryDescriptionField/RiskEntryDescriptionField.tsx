import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Label, Textarea } from '@/shared/components'

/** Props for {@link RiskEntryDescriptionField}. */
interface RiskEntryDescriptionFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Spread-able props returned by `register('description')`. */
  inputProps: UseFormRegisterReturn
  /** Validation error for the description field. */
  error?: FieldError
}

/**
 * Labelled textarea for the risk entry description field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.inputProps - Spread-able props returned by `register('description')`.
 * @param props.error - Validation error for the description field.
 * @returns The labelled description textarea.
 */
export function RiskEntryDescriptionField({
  idPrefix,
  inputProps,
  error,
}: RiskEntryDescriptionFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-description`}>
        {t('pages.riskManagement.createRiskEntry.fields.description')}
      </Label>
      <Textarea
        id={`${idPrefix}-description`}
        placeholder={t('pages.riskManagement.createRiskEntry.fields.descriptionPlaceholder')}
        rows={3}
        aria-invalid={error !== undefined}
        {...inputProps}
      />
    </div>
  )
}
