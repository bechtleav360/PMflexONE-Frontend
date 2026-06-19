import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Input, Label, showPromise } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useCreatePortfolio } from '../hooks/useCreatePortfolio'
import { useCreatePortfolioDialogStore } from '../store/useCreatePortfolioDialogStore'
import { portfolioSchema, type PortfolioFormValues } from '../utils/portfolioSchema'
import { PortfolioYearField } from './PortfolioYearField'

type TFn = (key: string) => string
function getPortfolioNameError(message: string | undefined, t: TFn): string | undefined {
  if (!message) return undefined
  return message === 'too_big'
    ? t('pages.portfolios.validation.titleMaxLength')
    : t('pages.portfolios.validation.titleRequired')
}

/**
 * Form for creating a new portfolio.
 * On submit, closes the dialog immediately and tracks the mutation via a promise toast.
 *
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreatePortfolioForm() {
  const { t } = useTranslation()
  const { mutateAsync } = useCreatePortfolio()
  const close = useCreatePortfolioDialogStore((s) => s.close)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { name: '', startYear: null, endYear: null },
  })

  function onSubmit(values: PortfolioFormValues) {
    close()
    showPromise(
      mutateAsync({ name: values.name, startYear: values.startYear, endYear: values.endYear }),
      {
        loading: t('pages.portfolios.form.toast.creating'),
        success: t('pages.portfolios.form.toast.success'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.portfolios.form.toast.error')),
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
        <Label htmlFor="portfolio-name">
          {t('pages.portfolios.form.titleLabel')}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </Label>
        <Input
          id="portfolio-name"
          placeholder={t('pages.portfolios.form.titlePlaceholder')}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'portfolio-name-error' : undefined}
          {...register('name')}
        />
        {nameErrorMessage && (
          <p
            id="portfolio-name-error"
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
              id="portfolio-start-year"
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
              id="portfolio-end-year"
              label={t('pages.portfolios.form.endYearLabel')}
              value={field.value}
              onChange={field.onChange}
              errorId={errors.endYear ? 'portfolio-end-year-error' : undefined}
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
        <Button type="submit">{t('pages.portfolios.form.submit')}</Button>
      </div>
    </form>
  )
}
