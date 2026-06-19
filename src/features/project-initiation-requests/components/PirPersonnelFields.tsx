import type { FieldErrors, FieldPath, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'

interface PirPersonnelFieldsProps {
  register: UseFormRegister<ProjectInitiationRequestFormValues>
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
}

/**
 * Converts an empty string to `null`; passes all other values through unchanged.
 *
 * @param v - The value to transform.
 * @returns `null` for empty strings, otherwise `v` (or `null` if `v` is nullish).
 */
const nullTransform = (v: unknown) => (v === '' ? null : (v ?? null))

interface FieldDef {
  id: string
  name: FieldPath<ProjectInitiationRequestFormValues>
  labelKey: string
  required: boolean
  errorKey?: string
}

const FIELD_ROWS: FieldDef[][] = [
  [
    {
      id: 'pir-projectInitiator',
      name: 'projectInitiator',
      labelKey: 'pages.initiationRequests.form.projectInitiatorLabel',
      required: true,
      errorKey: 'pages.initiationRequests.validation.projectInitiatorRequired',
    },
    {
      id: 'pir-projectOwner',
      name: 'projectOwner',
      labelKey: 'pages.initiationRequests.form.projectOwnerLabel',
      required: true,
      errorKey: 'pages.initiationRequests.validation.projectOwnerRequired',
    },
  ],
  [
    {
      id: 'pir-organizationalUnit',
      name: 'organizationalUnit',
      labelKey: 'pages.initiationRequests.form.organizationalUnitLabel',
      required: true,
      errorKey: 'pages.initiationRequests.validation.organizationalUnitRequired',
    },
    {
      id: 'pir-solutionProvider',
      name: 'solutionProvider',
      labelKey: 'pages.initiationRequests.form.solutionProviderLabel',
      required: false,
    },
  ],
]

const APPROVAL_FIELD: FieldDef = {
  id: 'pir-approvalAuthority',
  name: 'approvalAuthority',
  labelKey: 'pages.initiationRequests.form.approvalAuthorityLabel',
  required: true,
  errorKey: 'pages.initiationRequests.validation.approvalAuthorityRequired',
}

/**
 * Personnel fields section of the PIR form: project initiator, project owner,
 * organisational unit, solution provider, and approval authority.
 *
 * @param props - Component props.
 * @param props.register - RHF register function.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isView - When true required-field asterisks are hidden.
 * @returns A fragment containing the personnel input fields.
 */
export function PirPersonnelFields({
  register,
  errors,
  disabled,
  isView,
}: PirPersonnelFieldsProps) {
  const { t } = useTranslation()

  function renderField(field: FieldDef) {
    const error = errors[field.name]
    const errorId = error && field.errorKey ? `${field.id}-error` : undefined
    return (
      <div
        key={field.id}
        className="flex flex-col gap-1.5"
      >
        <Label htmlFor={field.id}>
          {t(field.labelKey)}
          {!isView && field.required && (
            <span
              className="text-destructive ml-0.5"
              aria-hidden="true"
            >
              {REQUIRED_MARKER}
            </span>
          )}
        </Label>
        <Input
          id={field.id}
          disabled={disabled}
          aria-invalid={error !== undefined}
          aria-describedby={errorId}
          aria-required={!isView && field.required ? 'true' : undefined}
          {...register(field.name, { setValueAs: nullTransform })}
        />
        {error && field.errorKey && (
          <p
            id={errorId}
            role="alert"
            className="text-destructive text-sm"
          >
            {t(field.errorKey)}
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      {FIELD_ROWS.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-2 gap-4"
        >
          {row.map(renderField)}
        </div>
      ))}
      {renderField(APPROVAL_FIELD)}
    </>
  )
}
