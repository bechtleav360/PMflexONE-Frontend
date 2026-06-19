import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/person'
import {
  Combobox,
  DatePicker,
  Input,
  Label,
  MarkdownEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import { parseLocalDate, toLocalISODate } from '../../utils'
import type { AssumptionFormValues } from '../../utils/assumptionSchema'
import { assumptionFormSchema } from '../../utils/assumptionSchema'
import { AssumptionRiskSection } from '../AssumptionRiskSection'

/** Props for {@link CreateAssumptionForm}. */
interface CreateAssumptionFormProps {
  /** Called with validated form values when the user submits. */
  onSubmit: (values: AssumptionFormValues) => void
}

/**
 * Form for creating a new assumption.
 *
 * Uses react-hook-form + Zod. Includes name, description, due date, validation status,
 * isRisk flag, other information, and validated by combobox.
 * On create, `linkedRisk` is always null and `hasRiskWriteAccess` is always true
 * (no RBAC check is required at the create stage).
 *
 * @param props - Component props.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateAssumptionForm({ onSubmit }: CreateAssumptionFormProps) {
  const { t } = useTranslation()
  const { data: personOptions = [], isLoading: personsLoading } = usePersons()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AssumptionFormValues>({
    resolver: zodResolver(assumptionFormSchema),
    defaultValues: {
      name: '',
      description: null,
      dueDate: null,
      validationStatus: 'OPEN',
      isRisk: false,
      otherInformation: null,
      validatedById: null,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      id="create-assumption-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-assumption-name">
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
          id="create-assumption-name"
          aria-describedby={errors.name ? 'create-assumption-name-error' : undefined}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="create-assumption-name-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-assumption-description">
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
        <Label htmlFor="create-assumption-due-date">
          {t('features.planningObjects.assumptions.dueDate')}
        </Label>
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="create-assumption-due-date"
              value={field.value ? parseLocalDate(field.value) : null}
              onChange={(d) => field.onChange(d ? toLocalISODate(d) : null)}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-assumption-validation-status">
          {t('features.planningObjects.assumptions.validationStatusLabel')}
        </Label>
        <Controller
          name="validationStatus"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="create-assumption-validation-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['OPEN', 'IN_REVIEW', 'VALIDATED', 'REFUTED'] as const).map((v) => (
                  <SelectItem
                    key={v}
                    value={v}
                  >
                    {t(`features.planningObjects.assumptions.validationStatusValues.${v}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        name="isRisk"
        control={control}
        render={({ field }) => (
          <AssumptionRiskSection
            isRisk={field.value}
            linkedRisk={null}
            hasRiskWriteAccess={true}
            onIsRiskChange={(v) => field.onChange(v)}
          />
        )}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-assumption-other-info">
          {t('features.planningObjects.assumptions.otherInformation')}
        </Label>
        <Controller
          name="otherInformation"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.assumptions.otherInformation')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-assumption-validated-by">
          {t('features.planningObjects.assumptions.validatedBy')}
        </Label>
        <Controller
          name="validatedById"
          control={control}
          render={({ field }) => (
            <Combobox
              id="create-assumption-validated-by"
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
