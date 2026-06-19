import type { Control, FieldErrors } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type {
  ProjectInitiationRequestFormValues,
  ScopeType,
} from '../utils/projectInitiationRequestSchema'
import { scopeTypeValues } from '../utils/projectInitiationRequestSchema'
import { ScopeIdSelectorField } from './ScopeIdSelectorField'

interface ScopeSelectorFieldProps {
  control: Control<ProjectInitiationRequestFormValues>
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
}

/**
 * Scope-type and scope-entity selectors for the project PIR form.
 *
 * Renders a `Select` for the scope type (Program / Portfolio) and, once a type
 * is chosen, delegates scope-entity selection to `ScopeIdSelectorField`.
 * Changing the scope type resets the scope-entity value.
 *
 * @param props - Component props.
 * @param props.control - RHF control object.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isView - When true required-field markers are hidden.
 * @returns The scope selector fields.
 */
export function ScopeSelectorField({ control, errors, disabled, isView }: ScopeSelectorFieldProps) {
  const { t } = useTranslation()
  const { field: scopeTypeField } = useController({ name: 'scopeType', control })
  const { field: scopeIdField } = useController({ name: 'scopeId', control })
  const scopeType = scopeTypeField.value as ScopeType | undefined

  function handleScopeTypeChange(value: string) {
    scopeTypeField.onChange(value as ScopeType)
    scopeIdField.onChange('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pir-scopeType">
          {t('pages.initiationRequests.form.scopeTypeLabel')}
          {!isView && (
            <span
              className="text-destructive ml-0.5"
              aria-hidden="true"
            >
              {REQUIRED_MARKER}
            </span>
          )}
        </Label>
        <Select
          value={scopeTypeField.value ?? ''}
          onValueChange={handleScopeTypeChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="pir-scopeType"
            aria-invalid={errors.scopeType !== undefined}
            aria-required={isView ? undefined : 'true'}
          >
            <SelectValue placeholder={t('pages.initiationRequests.form.scopeTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {scopeTypeValues.map((type) => (
              <SelectItem
                key={type}
                value={type}
                data-testid={`option-${type.toLowerCase()}`}
              >
                {t(`pages.initiationRequests.form.scopeType.${type.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.scopeType && (
          <p
            role="alert"
            className="text-destructive text-sm"
          >
            {t('pages.initiationRequests.validation.scopeTypeRequired')}
          </p>
        )}
      </div>

      {scopeType && (
        <ScopeIdSelectorField
          scopeType={scopeType}
          value={scopeIdField.value}
          onChange={scopeIdField.onChange}
          errors={errors}
          disabled={disabled}
          isView={isView}
        />
      )}
    </div>
  )
}
