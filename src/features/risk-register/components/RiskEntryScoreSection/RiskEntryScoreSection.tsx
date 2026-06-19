import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'

/** Props for {@link RiskEntryScoreSection}. */
interface RiskEntryScorescoreSectionProps {
  /** ID prefix for scoping form element IDs (e.g. `"risk-entry"` or `"edit-risk-entry"`). */
  idPrefix: string
  /** Spread-able props returned by `register('probability', ...)`. */
  probabilityInputProps: UseFormRegisterReturn
  /** Validation error for the probability field. */
  probabilityError?: FieldError
  /** Spread-able props returned by `register('impact', ...)`. */
  impactInputProps: UseFormRegisterReturn
  /** Validation error for the impact field. */
  impactError?: FieldError
}

/**
 * Two-column grid with probability and impact number inputs (1–5 scale).
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.probabilityInputProps - Spread-able props returned by `register('probability', ...)`.
 * @param props.probabilityError - Validation error for the probability field.
 * @param props.impactInputProps - Spread-able props returned by `register('impact', ...)`.
 * @param props.impactError - Validation error for the impact field.
 * @returns The labelled probability and impact inputs in a two-column layout.
 */
export function RiskEntryScoreSection({
  idPrefix,
  probabilityInputProps,
  probabilityError,
  impactInputProps,
  impactError,
}: RiskEntryScorescoreSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-probability`}>
          {t('pages.riskManagement.createRiskEntry.fields.probability')}
        </Label>
        <Input
          id={`${idPrefix}-probability`}
          type="number"
          min={1}
          max={5}
          placeholder={t('pages.riskManagement.createRiskEntry.fields.probabilityPlaceholder')}
          aria-invalid={probabilityError !== undefined}
          aria-describedby={probabilityError ? `${idPrefix}-probability-error` : undefined}
          {...probabilityInputProps}
        />
        {probabilityError && (
          <p
            id={`${idPrefix}-probability-error`}
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.riskManagement.validation.scoreRange')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-impact`}>
          {t('pages.riskManagement.createRiskEntry.fields.impact')}
        </Label>
        <Input
          id={`${idPrefix}-impact`}
          type="number"
          min={1}
          max={5}
          placeholder={t('pages.riskManagement.createRiskEntry.fields.impactPlaceholder')}
          aria-invalid={impactError !== undefined}
          aria-describedby={impactError ? `${idPrefix}-impact-error` : undefined}
          {...impactInputProps}
        />
        {impactError && (
          <p
            id={`${idPrefix}-impact-error`}
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.riskManagement.validation.scoreRange')}
          </p>
        )}
      </div>
    </div>
  )
}
