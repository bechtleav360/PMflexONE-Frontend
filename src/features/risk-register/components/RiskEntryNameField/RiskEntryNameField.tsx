import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

/** Props for {@link RiskEntryNameField}. */
interface RiskEntryNameFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Spread-able props returned by `register('name')`. */
  inputProps: UseFormRegisterReturn
  /** Validation error for the name field. */
  error?: FieldError
}

/**
 * Labelled text input for the risk/opportunity name field.
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.inputProps - Spread-able props returned by `register('name')`.
 * @param props.error - Validation error for the name field.
 * @returns The labelled name input with optional inline error.
 */
export function RiskEntryNameField({ idPrefix, inputProps, error }: RiskEntryNameFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-name`}>
        {t('pages.riskManagement.createRiskEntry.fields.name')}
        <span
          className="text-destructive ml-0.5"
          aria-hidden="true"
        >
          {REQUIRED_MARKER}
        </span>
      </Label>
      <Input
        id={`${idPrefix}-name`}
        placeholder={t('pages.riskManagement.createRiskEntry.fields.namePlaceholder')}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-name-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p
          id={`${idPrefix}-name-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {error.message ? t(error.message) : t('pages.riskManagement.validation.nameRequired')}
        </p>
      )}
    </div>
  )
}
