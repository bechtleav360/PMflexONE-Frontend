import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'
import { ProjectSelectorField } from './ProjectSelectorField'
import { ScopeSelectorField } from './ScopeSelectorField'

interface MandatoryFieldsProps {
  register: UseFormRegister<ProjectInitiationRequestFormValues>
  control: Control<ProjectInitiationRequestFormValues>
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
  /** When true, required-field asterisks are hidden (view mode). */
  isView: boolean
  /** When true, the requesting-project selector is locked (pre-set by project context). */
  projectLocked?: boolean
}

/**
 * Mandatory fields section of the PIR form: name, document version, requesting project.
 *
 * @param props - Component props.
 * @param props.register - RHF register function.
 * @param props.control - RHF control object.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isView - When true required-field asterisks are hidden.
 * @param props.projectLocked - When true, the requesting-project selector is locked.
 * @returns The mandatory fields fieldset.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function ProjectInitiationRequestMandatoryFields({
  register,
  control,
  errors,
  disabled,
  isView,
  projectLocked = false,
}: MandatoryFieldsProps) {
  const { t } = useTranslation()

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('pages.initiationRequests.form.mandatorySection')}</legend>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pir-name">
          {t('pages.initiationRequests.form.nameLabel')}
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
          id="pir-name"
          required
          placeholder={t('pages.initiationRequests.form.namePlaceholder')}
          disabled={disabled}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'pir-name-error' : undefined}
          aria-required={isView ? undefined : 'true'}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="pir-name-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pir-documentVersion">
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
          id="pir-documentVersion"
          placeholder={t('pages.initiationRequests.form.documentVersionPlaceholder')}
          disabled={disabled}
          aria-invalid={errors.documentVersion !== undefined}
          aria-describedby={errors.documentVersion ? 'pir-documentVersion-error' : undefined}
          aria-required={isView ? undefined : 'true'}
          {...register('documentVersion')}
        />
        {errors.documentVersion && (
          <p
            id="pir-documentVersion-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.documentVersionRequired')}
          </p>
        )}
      </div>

      <Controller
        name="requestingProjectId"
        control={control}
        render={({ field }) => (
          <ProjectSelectorField
            id="pir-requestingProject"
            value={field.value}
            onChange={field.onChange}
            disabled={disabled || projectLocked}
            isView={isView}
            errorMessage={
              errors.requestingProjectId
                ? t('pages.initiationRequests.validation.requestingProjectRequired')
                : undefined
            }
          />
        )}
      />

      <ScopeSelectorField
        control={control}
        errors={errors}
        disabled={disabled}
        isView={isView}
      />
    </fieldset>
  )
}
