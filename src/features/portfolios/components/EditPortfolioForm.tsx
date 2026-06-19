import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Input, Label, showPromise } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useUpdatePortfolio } from '../hooks/useUpdatePortfolio'
import { useEditPortfolioDialogStore } from '../store/useEditPortfolioDialogStore'
import type { Portfolio } from '../types/portfolio.types'
import { portfolioSchema, type PortfolioFormValues } from '../utils/portfolioSchema'
import { PortfolioYearField } from './PortfolioYearField'

type TFn = (key: string) => string
function getPortfolioNameError(message: string | undefined, t: TFn): string | undefined {
  if (!message) return undefined
  return message === 'too_big'
    ? t('pages.portfolios.validation.titleMaxLength')
    : t('pages.portfolios.validation.titleRequired')
}

interface EditPortfolioFormProps {
  /** The portfolio to pre-fill the form with. */
  portfolio: Portfolio
}

/**
 * Form for editing an existing portfolio.
 * Pre-fills all fields from the given portfolio.
 * On submit, closes the dialog immediately and tracks the mutation via a promise toast.
 *
 * @param props - Component props.
 * @param props.portfolio - The portfolio to pre-fill the form with.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function EditPortfolioForm({ portfolio }: EditPortfolioFormProps) {
  const { t } = useTranslation()
  const { mutateAsync } = useUpdatePortfolio()
  const close = useEditPortfolioDialogStore((s) => s.close)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: portfolio.name,
      startYear: portfolio.startYear,
      endYear: portfolio.endYear,
    },
  })

  function onSubmit(values: PortfolioFormValues) {
    close()
    showPromise(
      mutateAsync({
        id: portfolio.id,
        input: {
          version: portfolio.version,
          name: values.name,
          startYear: values.startYear,
          endYear: values.endYear,
        },
      }),
      {
        loading: t('pages.portfolios.editForm.toast.updating'),
        success: t('pages.portfolios.editForm.toast.success'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.portfolios.editForm.toast.error')),
      },
    )
  }

  const nameErrorMessage = getPortfolioNameError(errors.name?.message, t)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-portfolio-name">
          {t('pages.portfolios.form.titleLabel')}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </Label>
        <Input
          id="edit-portfolio-name"
          placeholder={t('pages.portfolios.form.titlePlaceholder')}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'edit-portfolio-name-error' : undefined}
          {...register('name')}
        />
        {nameErrorMessage && (
          <p
            id="edit-portfolio-name-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {nameErrorMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startYear"
          control={control}
          render={({ field }) => (
            <PortfolioYearField
              id="edit-portfolio-start-year"
              label={t('pages.portfolios.form.startYearLabel')}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="endYear"
          control={control}
          render={({ field }) => (
            <PortfolioYearField
              id="edit-portfolio-end-year"
              label={t('pages.portfolios.form.endYearLabel')}
              value={field.value}
              onChange={field.onChange}
              errorId={errors.endYear ? 'edit-portfolio-end-year-error' : undefined}
              errorMessage={
                errors.endYear ? t('pages.portfolios.validation.yearRangeInvalid') : undefined
              }
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={close}
        >
          {t('pages.portfolios.form.cancel')}
        </Button>
        <Button type="submit">{t('pages.portfolios.editForm.submit')}</Button>
      </div>
    </form>
  )
}
