import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'
import { Checkbox, Combobox, DatePicker, Input, Label, MarkdownEditor } from '@/shared/components'

import { parseLocalDate, toLocalISODate } from '../../utils'
import type { ConstraintFormValues } from '../../utils/constraintSchema'
import { constraintFormSchema } from '../../utils/constraintSchema'

/** Props for {@link CreateConstraintForm}. */
interface CreateConstraintFormProps {
  /** Called with validated form values when the user submits. */
  onSubmit: (values: ConstraintFormValues) => void
}

/**
 * Form for creating a new project constraint.
 *
 * Uses react-hook-form + Zod. Includes name, description, time-bound checkbox,
 * conditional deadline date picker, other information, and owner combobox.
 * When the time-bound checkbox is unchecked, the deadline field is hidden and
 * the `dueDate` value is reset to `null`.
 *
 * @param props - Component props.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateConstraintForm({ onSubmit }: CreateConstraintFormProps) {
  const { t } = useTranslation()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConstraintFormValues>({
    resolver: zodResolver(constraintFormSchema),
    defaultValues: {
      name: '',
      description: null,
      timeConstrained: false,
      dueDate: null,
      otherInformation: null,
      ownerId: null,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() is subscription-based; memoization would break reactivity
  const timeConstrained = watch('timeConstrained')

  useEffect(() => {
    if (!timeConstrained) {
      setValue('dueDate', null)
    }
  }, [timeConstrained, setValue])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      id="create-constraint-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-constraint-name">
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
          id="create-constraint-name"
          aria-describedby={errors.name ? 'create-constraint-name-error' : undefined}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="create-constraint-name-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-constraint-description">
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

      <div className="flex items-center gap-2">
        <Controller
          name="timeConstrained"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="create-constraint-time-constrained"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <Label
          htmlFor="create-constraint-time-constrained"
          className="cursor-pointer"
        >
          {t('features.planningObjects.constraints.timeBound')}
        </Label>
      </div>

      {timeConstrained && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-constraint-due-date">
            {t('features.planningObjects.constraints.deadline')}
          </Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="create-constraint-due-date"
                value={field.value ? parseLocalDate(field.value) : null}
                onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
              />
            )}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-constraint-other-info">
          {t('features.planningObjects.common.otherInfo')}
        </Label>
        <Controller
          name="otherInformation"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.common.otherInfo')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-constraint-owner">
          {t('features.planningObjects.constraints.owner')}
        </Label>
        <Controller
          name="ownerId"
          control={control}
          render={({ field }) => (
            <Combobox
              id="create-constraint-owner"
              value={field.value ?? null}
              onChange={(v) => field.onChange(v)}
              options={personOptions}
              loading={personsLoading}
            />
          )}
        />
      </div>
    </form>
  )
}
