import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'

/** Props for {@link ProblemEntryImpactField}. */
interface ProblemEntryImpactFieldProps {
  /** ID prefix for scoping form element IDs (e.g. `"create-problem-entry"` or `"edit-problem-entry"`). */
  idPrefix: string
  /** Spread-able props returned by `register('impact', ...)`. */
  inputProps: UseFormRegisterReturn
  /** Validation error for the impact field. */
  error?: FieldError
}

/**
 * Labelled number input for the problem entry impact field (1–5 scale).
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.inputProps - Spread-able props returned by `register('impact', ...)`.
 * @param props.error - Validation error for the impact field.
 * @returns The labelled impact input with optional inline error.
 */
export function ProblemEntryImpactField({
  idPrefix,
  inputProps,
  error,
}: ProblemEntryImpactFieldProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${idPrefix}-impact`}>
        {t('pages.problemManagement.createProblemEntry.fields.impact')}
      </Label>
      <Input
        id={`${idPrefix}-impact`}
        type="number"
        min={1}
        max={5}
        placeholder={t('pages.problemManagement.createProblemEntry.fields.impactPlaceholder')}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${idPrefix}-impact-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p
          id={`${idPrefix}-impact-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.problemManagement.validation.scoreRange')}
        </p>
      )}
    </div>
  )
}
