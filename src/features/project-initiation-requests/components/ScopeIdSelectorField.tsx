import type { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePortfolios } from '@/features/portfolios'
import { usePrograms } from '@/features/programs'
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

interface ScopeIdSelectorFieldProps {
  scopeType: ScopeType
  value: string
  onChange: (value: string) => void
  errors: FieldErrors<ProjectInitiationRequestFormValues>
  disabled: boolean
  isView: boolean
}

/**
 * Scope-entity selector for the project PIR form.
 *
 * Fetches programs or portfolios based on `scopeType` and renders a `Select`
 * populated with the matching items.
 *
 * @param props - Component props.
 * @param props.scopeType - Determines whether programs or portfolios are loaded.
 * @param props.value - Controlled field value.
 * @param props.onChange - Callback invoked when the selected value changes.
 * @param props.errors - RHF field errors.
 * @param props.disabled - When true the selector is non-interactive.
 * @param props.isView - When true the required marker is hidden.
 * @returns The scope-entity select field.
 */
export function ScopeIdSelectorField({
  scopeType,
  value,
  onChange,
  errors,
  disabled,
  isView,
}: ScopeIdSelectorFieldProps) {
  const { t } = useTranslation()
  const isProgram = scopeType === 'Program'
  const { data: programs = [], isPending: programsPending } = usePrograms()
  const { data: portfolios = [], isPending: portfoliosPending } = usePortfolios()
  const items = isProgram ? programs : portfolios
  const isPending = isProgram ? programsPending : portfoliosPending

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pir-scopeId">
        {t(`pages.initiationRequests.form.scopeId.${scopeType.toLowerCase()}Label`)}
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
        value={value}
        onValueChange={onChange}
        disabled={disabled || isPending}
      >
        <SelectTrigger
          id="pir-scopeId"
          aria-invalid={errors.scopeId !== undefined}
          aria-required={isView ? undefined : 'true'}
        >
          <SelectValue
            placeholder={t(
              `pages.initiationRequests.form.scopeId.${scopeType.toLowerCase()}Placeholder`,
            )}
          />
        </SelectTrigger>
        <SelectContent>
          {items.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">
              {t(`pages.initiationRequests.form.scopeId.${scopeType.toLowerCase()}Empty`)}
            </div>
          ) : (
            items.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
              >
                {item.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {errors.scopeId && (
        <p
          role="alert"
          className="text-destructive text-sm"
        >
          {t('pages.initiationRequests.validation.scopeIdRequired')}
        </p>
      )}
    </div>
  )
}
