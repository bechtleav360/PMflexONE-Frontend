import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'

/** Props for {@link IssueEntryScoreSection}. */
interface IssueEntryScorescoreSectionProps {
  /** ID prefix for scoping form element IDs (e.g. `"issue-entry"` or `"edit-issue-entry"`). */
  idPrefix: string
  /** Spread-able props returned by `register('urgency', ...)`. */
  urgencyInputProps: UseFormRegisterReturn
  /** Validation error for the urgency field. */
  urgencyError?: FieldError
  /** Spread-able props returned by `register('impact', ...)`. */
  impactInputProps: UseFormRegisterReturn
  /** Validation error for the impact field. */
  impactError?: FieldError
}

/**
 * Two-column grid with urgency and impact number inputs (1–5 scale).
 *
 * @param props - Component props.
 * @param props.idPrefix - ID prefix for scoping form element IDs.
 * @param props.urgencyInputProps - Spread-able props returned by `register('urgency', ...)`.
 * @param props.urgencyError - Validation error for the urgency field.
 * @param props.impactInputProps - Spread-able props returned by `register('impact', ...)`.
 * @param props.impactError - Validation error for the impact field.
 * @returns The labelled urgency and impact inputs in a two-column layout.
 */
export function IssueEntryScoreSection({
  idPrefix,
  urgencyInputProps,
  urgencyError,
  impactInputProps,
  impactError,
}: IssueEntryScorescoreSectionProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-urgency`}>
          {t('pages.issueManagement.createIssueEntry.fields.urgency')}
        </Label>
        <Input
          id={`${idPrefix}-urgency`}
          type="number"
          min={1}
          max={5}
          placeholder={t('pages.issueManagement.createIssueEntry.fields.urgencyPlaceholder')}
          aria-invalid={urgencyError !== undefined}
          aria-describedby={urgencyError ? `${idPrefix}-urgency-error` : undefined}
          {...urgencyInputProps}
        />
        {urgencyError && (
          <p
            id={`${idPrefix}-urgency-error`}
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.issueManagement.validation.scoreRange')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-impact`}>
          {t('pages.issueManagement.createIssueEntry.fields.impact')}
        </Label>
        <Input
          id={`${idPrefix}-impact`}
          type="number"
          min={1}
          max={5}
          placeholder={t('pages.issueManagement.createIssueEntry.fields.impactPlaceholder')}
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
            {t('pages.issueManagement.validation.scoreRange')}
          </p>
        )}
      </div>
    </div>
  )
}
