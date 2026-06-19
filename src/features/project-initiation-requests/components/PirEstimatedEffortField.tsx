import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'

interface PirEstimatedEffortFieldProps {
  register: UseFormRegister<ProjectInitiationRequestFormValues>
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
}

const setEffortValue = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null
  if (typeof v === 'number' && Number.isNaN(v)) return null
  return Number(v)
}

/**
 * Estimated effort number input field for the PIR form.
 *
 * @param props - Component props.
 * @param props.register - RHF register function.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true the field is non-interactive.
 * @returns The estimated effort input with optional error feedback.
 */
export function PirEstimatedEffortField({
  register,
  errors,
  disabled,
}: PirEstimatedEffortFieldProps) {
  const { t } = useTranslation()
  const errorId = errors.estimatedEffort ? 'pir-estimatedEffort-error' : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pir-estimatedEffort">
        {t('pages.initiationRequests.form.estimatedEffortLabel')}
      </Label>
      <Input
        id="pir-estimatedEffort"
        type="number"
        min="0"
        step="0.5"
        disabled={disabled}
        aria-invalid={errors.estimatedEffort !== undefined}
        aria-describedby={errorId}
        {...register('estimatedEffort', { setValueAs: setEffortValue })}
      />
      {errors.estimatedEffort && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.initiationRequests.validation.estimatedEffortInvalid')}
        </p>
      )}
    </div>
  )
}
