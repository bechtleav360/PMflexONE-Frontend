import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Label, Textarea } from '@/shared/components'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'
import { PirDateField } from './PirDateField'
import { PirDeliveryTypeField } from './PirDeliveryTypeField'
import { PirEstimatedEffortField } from './PirEstimatedEffortField'
import { PirPersonnelFields } from './PirPersonnelFields'

interface OptionalFieldsProps {
  register: UseFormRegister<ProjectInitiationRequestFormValues>
  control: Control<ProjectInitiationRequestFormValues>
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
}

/**
 * Optional fields section of the PIR form: personnel, dates, estimated effort,
 * effort comment, and delivery type.
 *
 * @param props - Component props.
 * @param props.register - RHF register function.
 * @param props.control - RHF control object.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isView - When true required-field asterisks are hidden.
 * @returns The optional fields fieldset.
 */
export function ProjectInitiationRequestOptionalFields({
  register,
  control,
  errors,
  disabled,
  isView,
}: OptionalFieldsProps) {
  const { t } = useTranslation()

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('pages.initiationRequests.form.optionalSection')}</legend>

      <PirPersonnelFields
        register={register}
        errors={errors}
        disabled={disabled}
        isView={isView}
      />

      <div className="grid grid-cols-2 gap-4">
        <PirDateField
          id="pir-requestDate"
          label={t('pages.initiationRequests.form.requestDateLabel')}
          fieldName="requestDate"
          control={control}
          errorMessage={
            errors.requestDate
              ? t('pages.initiationRequests.validation.requestDateRequired')
              : undefined
          }
          disabled={disabled}
          required
          isView={isView}
        />
        <PirDateField
          id="pir-targetDeliveryDate"
          label={t('pages.initiationRequests.form.targetDeliveryDateLabel')}
          fieldName="targetDeliveryDate"
          control={control}
          errorMessage={
            errors.targetDeliveryDate
              ? t('pages.initiationRequests.validation.targetDeliveryDateRequired')
              : undefined
          }
          disabled={disabled}
          required
          isView={isView}
        />
      </div>

      <PirEstimatedEffortField
        register={register}
        errors={errors}
        disabled={disabled}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pir-estimatedEffortComment">
          {t('pages.initiationRequests.form.estimatedEffortCommentLabel')}
        </Label>
        <Textarea
          id="pir-estimatedEffortComment"
          disabled={disabled}
          rows={3}
          {...register('estimatedEffortComment')}
        />
      </div>

      <PirDeliveryTypeField
        control={control}
        disabled={disabled}
        errorMessage={
          errors.deliveryType
            ? t('pages.initiationRequests.validation.deliveryTypeRequired')
            : undefined
        }
        isView={isView}
      />
    </fieldset>
  )
}
