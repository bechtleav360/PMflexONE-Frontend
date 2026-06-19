import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePortfolios } from '@/features/portfolios'
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'

interface ProgramPortfolioFieldProps {
  control: Control<ProgramInitiationRequestFormValues>
  disabled: boolean
  isCreate: boolean
  isView: boolean
  portfolioName?: string | null
}

/**
 * Portfolio field for the program PIR form.
 *
 * Renders a `Select` in create mode (fetches portfolios internally) and a
 * read-only `Input` in view mode. Returns `null` when neither mode is active.
 *
 * @param props - Component props.
 * @param props.control - RHF control object.
 * @param props.disabled - When true all fields are non-interactive.
 * @param props.isCreate - When true the portfolio selector is shown.
 * @param props.isView - When true a read-only portfolio name input is shown.
 * @param props.portfolioName - Portfolio display name shown in view mode.
 * @returns The portfolio field element, or null when not applicable.
 */
export function ProgramPortfolioField({
  control,
  disabled,
  isCreate,
  isView,
  portfolioName = null,
}: ProgramPortfolioFieldProps) {
  const { t } = useTranslation()
  const { field: portfolioIdField } = useController({ name: 'portfolioId', control })
  const { data: portfolios = [], isPending: portfoliosPending } = usePortfolios()

  if (isCreate) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-portfolioId">
          {t('pages.programInitiationRequests.form.portfolioLabel')}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </Label>
        <Select
          value={portfolioIdField.value ?? ''}
          onValueChange={portfolioIdField.onChange}
          disabled={disabled || portfoliosPending}
        >
          <SelectTrigger
            id="ppir-portfolioId"
            aria-required="true"
          >
            <SelectValue
              placeholder={t('pages.programInitiationRequests.form.portfolioPlaceholder')}
            />
          </SelectTrigger>
          <SelectContent>
            {portfolios.length === 0 ? (
              <div className="text-muted-foreground px-2 py-1.5 text-sm">
                {t('pages.programInitiationRequests.form.portfolioEmpty')}
              </div>
            ) : (
              portfolios.map((portfolio) => (
                <SelectItem
                  key={portfolio.id}
                  value={portfolio.id}
                >
                  {portfolio.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (isView) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ppir-portfolioName">
          {t('pages.programInitiationRequests.form.portfolioLabel')}
        </Label>
        <Input
          id="ppir-portfolioName"
          value={portfolioName ?? ''}
          disabled
          readOnly
          aria-readonly="true"
        />
      </div>
    )
  }

  return null
}
