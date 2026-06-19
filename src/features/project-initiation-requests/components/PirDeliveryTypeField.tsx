import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
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

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'

interface PirDeliveryTypeFieldProps {
  control: Control<ProjectInitiationRequestFormValues>
  disabled: boolean
  errorMessage?: string
  isView?: boolean
}

/**
 * Controlled delivery-type select field for the PIR form.
 *
 * @param props - Component props.
 * @param props.control - RHF control object.
 * @param props.disabled - When true the select is non-interactive.
 * @param props.errorMessage - Validation error text rendered below the field.
 * @param props.isView - When true suppresses the required marker.
 * @returns A labelled delivery-type select with optional inline error.
 */
export function PirDeliveryTypeField({
  control,
  disabled,
  errorMessage,
  isView = false,
}: PirDeliveryTypeFieldProps) {
  const { t } = useTranslation()
  const errorId = errorMessage ? 'pir-deliveryType-error' : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="pir-deliveryType">
        {t('pages.initiationRequests.form.deliveryTypeLabel')}
        {!isView && (
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        )}
      </Label>
      <Controller
        name="deliveryType"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="pir-deliveryType"
              aria-invalid={errorMessage !== undefined}
              aria-describedby={errorId}
              aria-required={isView ? undefined : 'true'}
            >
              <SelectValue
                placeholder={t('pages.initiationRequests.form.deliveryTypePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="internal"
                data-testid="option-internal"
              >
                {t('pages.initiationRequests.form.deliveryType.internal')}
              </SelectItem>
              <SelectItem
                value="external"
                data-testid="option-external"
              >
                {t('pages.initiationRequests.form.deliveryType.external')}
              </SelectItem>
              <SelectItem
                value="mixed"
                data-testid="option-mixed"
              >
                {t('pages.initiationRequests.form.deliveryType.mixed')}
              </SelectItem>
              <SelectItem
                value="unknown"
                data-testid="option-unknown"
              >
                {t('pages.initiationRequests.form.deliveryType.unknown')}
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-sm"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
