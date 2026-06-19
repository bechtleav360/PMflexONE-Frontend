import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'
import { ProgramPortfolioField } from './ProgramPortfolioField'

interface MandatoryFieldsProps {
  register: UseFormRegister<ProgramInitiationRequestFormValues>
  control: Control<ProgramInitiationRequestFormValues>
  errors: FieldErrors<ProgramInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
  isCreate: boolean
  programName: string
  portfolioName?: string | null
}

/**
 * Mandatory fields section of the program PIR form: name, document version, requesting program.
 *
 * @param props - Component props.
 * @param props.register - RHF register function.
 * @param props.control - RHF control object passed to useController.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isView - When true required-field asterisks are hidden.
 * @param props.isCreate - When true the portfolio selector is shown instead of the read-only portfolio name.
 * @param props.programName - Display name shown in the read-only requesting-program field.
 * @param props.portfolioName - Portfolio display name shown in view mode.
 * @returns The mandatory fields fieldset.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function ProgramInitiationRequestMandatoryFields({
  register,
  control,
  errors,
  disabled,
  isView,
  isCreate,
  programName,
  portfolioName = null,
}: MandatoryFieldsProps) {
  const { t } = useTranslation()

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('pages.initiationRequests.form.mandatorySection')}</legend>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-name">
          {t('pages.programInitiationRequests.form.nameLabel')}
          {!isView && (
            <span
              className="text-destructive ml-0.5"
              aria-hidden="true"
            >
              {REQUIRED_MARKER}
            </span>
          )}
        </Label>
        <Input
          id="ppir-name"
          required
          placeholder={t('pages.programInitiationRequests.form.namePlaceholder')}
          disabled={disabled}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'ppir-name-error' : undefined}
          aria-required={isView ? undefined : 'true'}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="ppir-name-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.programInitiationRequests.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-documentVersion">
          {t('pages.initiationRequests.form.documentVersionLabel')}
          {!isView && (
            <span
              className="text-destructive ml-0.5"
              aria-hidden="true"
            >
              {REQUIRED_MARKER}
            </span>
          )}
        </Label>
        <Input
          id="ppir-documentVersion"
          placeholder={t('pages.initiationRequests.form.documentVersionPlaceholder')}
          disabled={disabled}
          aria-invalid={errors.documentVersion !== undefined}
          aria-describedby={errors.documentVersion ? 'ppir-documentVersion-error' : undefined}
          aria-required={isView ? undefined : 'true'}
          {...register('documentVersion')}
        />
        {errors.documentVersion && (
          <p
            id="ppir-documentVersion-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.documentVersionRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-requestingProgram">
          {t('pages.programInitiationRequests.form.requestingProgramLabel')}
        </Label>
        <Input
          id="ppir-requestingProgram"
          value={programName}
          disabled
          readOnly
          aria-readonly="true"
        />
        {/* requestingProgramId is kept in form state via defaultValues; not editable */}
        <input
          type="hidden"
          {...register('requestingProgramId')}
        />
      </div>

      <ProgramPortfolioField
        control={control}
        disabled={disabled}
        isCreate={isCreate}
        isView={isView}
        portfolioName={portfolioName}
      />
    </fieldset>
  )
}
