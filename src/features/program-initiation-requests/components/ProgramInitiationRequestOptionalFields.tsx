/* eslint-disable max-lines -- seven form sections extracted into module-level helpers to comply with max-lines-per-function; file length is intrinsic to the number of required sections */
import type { TFunction } from 'i18next'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  DatePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'

interface OptionalFieldsProps {
  register: UseFormRegister<ProgramInitiationRequestFormValues>
  control: Control<ProgramInitiationRequestFormValues>
  errors: FieldErrors<ProgramInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
}

const nullTransform = (v: unknown) => (v === '' ? null : (v ?? null))
const setEffortValue = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null
  if (typeof v === 'number' && Number.isNaN(v)) return null
  return Number(v)
}
const dateToIso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)
const toSelectValue = (v: string | null | undefined) => v ?? ''
const getAriaRequired = (isView: boolean) => (!isView ? ('true' as const) : undefined)

const CAL_CLS =
  'absolute top-full z-50 mt-1 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md left-0'

interface SectionCtx {
  t: TFunction
  register: UseFormRegister<ProgramInitiationRequestFormValues>
  control: Control<ProgramInitiationRequestFormValues>
  errors: FieldErrors<ProgramInitiationRequestFormValues>
  disabled: boolean
  ariaRequired: 'true' | undefined
  req: React.ReactNode
}

function renderPersonnelSection({ t, register, errors, disabled, ariaRequired, req }: SectionCtx) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-projectInitiator">
          {t('pages.programInitiationRequests.form.programInitiatorLabel')}
          {req}
        </Label>
        <Input
          id="ppir-projectInitiator"
          disabled={disabled}
          aria-invalid={errors.projectInitiator !== undefined}
          aria-required={ariaRequired}
          {...register('projectInitiator', { setValueAs: nullTransform })}
        />
        {errors.projectInitiator && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.programInitiationRequests.validation.programInitiatorRequired')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-projectOwner">
          {t('pages.programInitiationRequests.form.programOwnerLabel')}
          {req}
        </Label>
        <Input
          id="ppir-projectOwner"
          disabled={disabled}
          aria-invalid={errors.projectOwner !== undefined}
          aria-required={ariaRequired}
          {...register('projectOwner', { setValueAs: nullTransform })}
        />
        {errors.projectOwner && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.programInitiationRequests.validation.programOwnerRequired')}
          </p>
        )}
      </div>
    </div>
  )
}

function renderOrganizationSection({
  t,
  register,
  errors,
  disabled,
  ariaRequired,
  req,
}: SectionCtx) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-organizationalUnit">
          {t('pages.initiationRequests.form.organizationalUnitLabel')}
          {req}
        </Label>
        <Input
          id="ppir-organizationalUnit"
          disabled={disabled}
          aria-invalid={errors.organizationalUnit !== undefined}
          aria-required={ariaRequired}
          {...register('organizationalUnit', { setValueAs: nullTransform })}
        />
        {errors.organizationalUnit && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.organizationalUnitRequired')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-solutionProvider">
          {t('pages.initiationRequests.form.solutionProviderLabel')}
        </Label>
        <Input
          id="ppir-solutionProvider"
          disabled={disabled}
          {...register('solutionProvider', { setValueAs: nullTransform })}
        />
      </div>
    </div>
  )
}

function renderDatesSection({ t, control, errors, disabled, ariaRequired, req }: SectionCtx) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-requestDate">
          {t('pages.initiationRequests.form.requestDateLabel')}
          {req}
        </Label>
        <Controller
          name="requestDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="ppir-requestDate"
              value={field.value ? new Date(field.value) : null}
              onChange={(d) => field.onChange(dateToIso(d))}
              disabled={disabled}
              aria-invalid={errors.requestDate !== undefined}
              aria-required={ariaRequired}
              className="relative"
              calendarClassName={CAL_CLS}
            />
          )}
        />
        {errors.requestDate && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.requestDateRequired')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-targetDeliveryDate">
          {t('pages.initiationRequests.form.targetDeliveryDateLabel')}
          {req}
        </Label>
        <Controller
          name="targetDeliveryDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              id="ppir-targetDeliveryDate"
              value={field.value ? new Date(field.value) : null}
              onChange={(d) => field.onChange(dateToIso(d))}
              disabled={disabled}
              aria-invalid={errors.targetDeliveryDate !== undefined}
              aria-required={ariaRequired}
              className="relative"
              calendarClassName={CAL_CLS}
            />
          )}
        />
        {errors.targetDeliveryDate && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.targetDeliveryDateRequired')}
          </p>
        )}
      </div>
    </div>
  )
}

function renderDeliveryTypeSection({
  t,
  control,
  errors,
  disabled,
  ariaRequired,
  req,
}: SectionCtx) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="ppir-deliveryType">
        {t('pages.initiationRequests.form.deliveryTypeLabel')}
        {req}
      </Label>
      <Controller
        name="deliveryType"
        control={control}
        render={({ field }) => (
          <Select
            value={toSelectValue(field.value)}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="ppir-deliveryType"
              aria-invalid={errors.deliveryType !== undefined}
              aria-required={ariaRequired}
            >
              <SelectValue
                placeholder={t('pages.initiationRequests.form.deliveryTypePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">
                {t('pages.initiationRequests.form.deliveryType.internal')}
              </SelectItem>
              <SelectItem value="external">
                {t('pages.initiationRequests.form.deliveryType.external')}
              </SelectItem>
              <SelectItem value="mixed">
                {t('pages.initiationRequests.form.deliveryType.mixed')}
              </SelectItem>
              <SelectItem value="unknown">
                {t('pages.initiationRequests.form.deliveryType.unknown')}
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.deliveryType && (
        <p
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.initiationRequests.validation.deliveryTypeRequired')}
        </p>
      )}
    </div>
  )
}

/**
 * Optional fields section of the program PIR form: personnel, dates, estimated effort,
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
export function ProgramInitiationRequestOptionalFields({
  register,
  control,
  errors,
  disabled,
  isView,
}: OptionalFieldsProps) {
  const { t } = useTranslation()
  const req = !isView && (
    <span
      className="text-destructive ml-0.5"
      aria-hidden="true"
    >
      {REQUIRED_MARKER}
    </span>
  )
  const ariaRequired = getAriaRequired(isView)
  const ctx = { t, register, control, errors, disabled, ariaRequired, req }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('pages.initiationRequests.form.optionalSection')}</legend>

      {renderPersonnelSection(ctx)}

      {renderOrganizationSection(ctx)}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-approvalAuthority">
          {t('pages.initiationRequests.form.approvalAuthorityLabel')}
          {req}
        </Label>
        <Input
          id="ppir-approvalAuthority"
          disabled={disabled}
          aria-invalid={errors.approvalAuthority !== undefined}
          aria-required={ariaRequired}
          {...register('approvalAuthority', { setValueAs: nullTransform })}
        />
        {errors.approvalAuthority && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.approvalAuthorityRequired')}
          </p>
        )}
      </div>

      {renderDatesSection(ctx)}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-estimatedEffort">
          {t('pages.initiationRequests.form.estimatedEffortLabel')}
        </Label>
        <Input
          id="ppir-estimatedEffort"
          type="number"
          min="0"
          step="0.5"
          disabled={disabled}
          aria-invalid={errors.estimatedEffort !== undefined}
          {...register('estimatedEffort', { setValueAs: setEffortValue })}
        />
        {errors.estimatedEffort && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.estimatedEffortInvalid')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-estimatedEffortComment">
          {t('pages.initiationRequests.form.estimatedEffortCommentLabel')}
        </Label>
        <Textarea
          id="ppir-estimatedEffortComment"
          disabled={disabled}
          rows={3}
          {...register('estimatedEffortComment')}
        />
      </div>

      {renderDeliveryTypeSection(ctx)}
    </fieldset>
  )
}
