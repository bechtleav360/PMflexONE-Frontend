import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'
import { Input } from '@/shared/components/Input'

import { useUpdateEscalatedEntry } from '../../hooks/useUpdateEscalatedEntry'
import type { EscalatedEntry } from '../../types/escalatedEntry.types'
import {
  UpdateAssessmentFormSchema,
  type UpdateAssessmentFormValues,
} from '../../utils/escalationSchemas'

interface EscalatedEntryAssessmentSectionProps {
  entry: Pick<EscalatedEntry, 'id' | 'version' | 'targetProbability' | 'targetImpact'>
  onSuccess?: () => void
  isLocked?: boolean
}

/**
 * Editable form section for target-level assessment fields (targetProbability, targetImpact).
 * Resets when entry id or version changes so re-fetched values are reflected.
 *
 * @param root0 - Component props.
 * @param root0.entry - Escalated entry providing id, version, and current assessment values.
 * @param root0.onSuccess - Optional callback invoked after a successful save.
 * @param root0.isLocked - When true, the save button is disabled.
 * @returns A form with editable assessment inputs and a save button.
 */
export function EscalatedEntryAssessmentSection({
  entry,
  onSuccess,
  isLocked = false,
}: EscalatedEntryAssessmentSectionProps) {
  const { t } = useTranslation()
  const { mutate, isPending } = useUpdateEscalatedEntry()

  const { register, handleSubmit, reset } = useForm<UpdateAssessmentFormValues>({
    resolver: zodResolver(UpdateAssessmentFormSchema),
    defaultValues: {
      targetProbability: entry.targetProbability ?? undefined,
      targetImpact: entry.targetImpact ?? undefined,
    },
  })

  useEffect(() => {
    reset({
      targetProbability: entry.targetProbability ?? undefined,
      targetImpact: entry.targetImpact ?? undefined,
    })
  }, [entry.id, entry.version, entry.targetProbability, entry.targetImpact, reset])

  function onSubmit(values: UpdateAssessmentFormValues) {
    mutate({ id: entry.id, version: entry.version, ...values }, { onSuccess })
  }

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">
        {t('features.escalatedEntries.detail.assessment.title')}
      </h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="targetProbability"
            className="text-xs font-medium"
          >
            {t('features.escalatedEntries.detail.assessment.targetProbability')}
          </label>
          <Input
            id="targetProbability"
            type="number"
            min={1}
            max={5}
            {...register('targetProbability', { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="targetImpact"
            className="text-xs font-medium"
          >
            {t('features.escalatedEntries.detail.assessment.targetImpact')}
          </label>
          <Input
            id="targetImpact"
            type="number"
            min={1}
            max={5}
            {...register('targetImpact', { valueAsNumber: true })}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isPending || isLocked}
        >
          {t('features.escalatedEntries.detail.assessment.save')}
        </Button>
      </form>
    </section>
  )
}
