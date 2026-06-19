import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Textarea } from '@/shared/components/Textarea'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import {
  EscalateEntryFormSchema,
  type EscalationReasonFormValues,
} from '../../utils/escalationSchemas'

interface EscalationReasonFormProps {
  formId: string
  onSubmit: (values: EscalationReasonFormValues) => void
  isDisabled: boolean
  /** i18n key prefix for reasonLabel and reasonPlaceholder (e.g. "features.escalatedEntries.dialogs.escalate"). */
  translationPrefix: string
}

/**
 * Shared form for entering a mandatory reason text (escalation or de-escalation).
 * Uses react-hook-form + EscalateEntryFormSchema (Zod). Accessibility wired via aria-describedby.
 *
 * @param root0 - Form props.
 * @param root0.formId - HTML id linking the form to an external submit button.
 * @param root0.onSubmit - Called with validated form values on successful submit.
 * @param root0.isDisabled - When true, all fields are disabled (mutation in-flight).
 * @param root0.translationPrefix - i18n key prefix used to resolve reasonLabel and reasonPlaceholder.
 * @returns A single-field form with a textarea for reason input and validation error display.
 */
export function EscalationReasonForm({
  formId,
  onSubmit,
  isDisabled,
  translationPrefix,
}: EscalationReasonFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EscalationReasonFormValues>({
    resolver: zodResolver(EscalateEntryFormSchema),
  })

  const errorId = `${formId}-reason-error`

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${formId}-reason`}
          className="text-sm font-medium"
        >
          {t(`${translationPrefix}.reasonLabel`)}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </label>
        <Textarea
          id={`${formId}-reason`}
          placeholder={t(`${translationPrefix}.reasonPlaceholder`)}
          disabled={isDisabled}
          aria-describedby={errors.reason ? errorId : undefined}
          aria-invalid={errors.reason ? true : undefined}
          {...register('reason')}
        />
        {errors.reason && (
          <p
            id={errorId}
            className="text-destructive text-sm"
            role="alert"
          >
            {errors.reason.message}
          </p>
        )}
      </div>
    </form>
  )
}
