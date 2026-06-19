import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DatePicker, Input, Label, MarkdownEditor } from '@/shared/components'

import { parseLocalDate, toLocalISODate } from '../../utils'
import type { GoalFormValues } from '../../utils/goalSchema'
import { goalFormSchema } from '../../utils/goalSchema'

/** Props for {@link CreateGoalForm}. */
interface CreateGoalFormProps {
  /** Called with validated form values when the user submits. */
  onSubmit: (values: GoalFormValues) => void
}

/**
 * Form for creating a new goal.
 *
 * Uses react-hook-form + Zod. Includes name, progress, description, due date,
 * key results, and other information. Accepted-by and accepted-at are not available
 * on create (the backend `CreateGoalInput` does not expose those fields — use edit instead).
 *
 * @param props - Component props.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateGoalForm({ onSubmit }: CreateGoalFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      description: null,
      progress: 0,
      dueDate: null,
      keyResults: null,
      impact: null,
      outcome: null,
      otherInformation: null,
      acceptedById: null,
      acceptedAt: null,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- watch() is a controlled read-only subscribe; no memoization hazard on a leaf value
  const progressValue = watch('progress') ?? 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      id="create-goal-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-name">
          {t('features.planningObjects.common.name')}
          <span
            aria-hidden="true"
            className="text-destructive ml-0.5"
          >
            {/* eslint-disable-next-line react/jsx-no-literals -- required-field asterisk is a UI convention, not translatable content */}
            {'*'}
          </span>
        </Label>
        <Input
          id="create-goal-name"
          aria-describedby={errors.name ? 'create-goal-name-error' : undefined}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="create-goal-name-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-progress">
          {t('features.planningObjects.goals.progress')}
          {/* eslint-disable-next-line react/jsx-no-literals -- unit/separator character is layout punctuation, not translatable content */}
          {': '}
          <span className="font-semibold tabular-nums">{progressValue}</span>
          {/* eslint-disable-next-line react/jsx-no-literals -- unit/separator character is layout punctuation, not translatable content */}
          {'%'}
        </Label>
        <Controller
          name="progress"
          control={control}
          render={({ field }) => (
            <input
              id="create-goal-progress"
              type="range"
              min={0}
              max={100}
              step={1}
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              className="accent-primary w-full"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={field.value ?? 0}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-description">
          {t('features.planningObjects.common.description')}
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.common.description')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-due-date">{t('features.planningObjects.common.dueDate')}</Label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="create-goal-due-date"
              value={field.value ? parseLocalDate(field.value) : null}
              onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-key-results">
          {t('features.planningObjects.goals.keyResults')}
        </Label>
        <Controller
          name="keyResults"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.goals.keyResults')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-impact">{t('features.planningObjects.goals.impact')}</Label>
        <Controller
          name="impact"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.goals.impact')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-outcome">{t('features.planningObjects.goals.outcome')}</Label>
        <Controller
          name="outcome"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.goals.outcome')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-goal-other-info">
          {t('features.planningObjects.goals.otherInformation')}
        </Label>
        <Controller
          name="otherInformation"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.goals.otherInformation')}
            />
          )}
        />
      </div>
    </form>
  )
}
