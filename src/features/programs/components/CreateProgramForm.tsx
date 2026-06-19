import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Input, Label, showError, showSuccess } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import { isDuplicateNameError } from '../api/programsApi'
import { useCreateProgram } from '../hooks/useCreateProgram'
import { useCreateProgramDialogStore } from '../store/useCreateProgramDialogStore'
import {
  createProgramSchema,
  getProgramNameErrorMessage,
  type CreateProgramFormValues,
} from '../utils/programSchema'

/**
 * Form for creating a new program.
 *
 * Reads the optional default portfolio from {@link useCreateProgramDialogStore}
 * and calls `close()` on success. Inline validation errors are shown for the
 * name field; server-side duplicate-name errors are mapped to a field-level error.
 *
 * @returns The rendered creation form.
 */
export function CreateProgramForm() {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useCreateProgram()
  const close = useCreateProgramDialogStore((s) => s.close)
  const defaultPortfolioId = useCreateProgramDialogStore((s) => s.defaultPortfolioId)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateProgramFormValues>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      portfolioId: defaultPortfolioId ?? undefined,
      metadata: null,
    },
  })

  async function onSubmit(values: CreateProgramFormValues) {
    try {
      const program = await mutateAsync({
        name: values.name,
        portfolioId: values.portfolioId ?? null,
        metadata: values.metadata ?? null,
      })
      close()
      showSuccess(t('pages.programs.createDialog.toast.success', { name: program.name }))
    } catch (err) {
      if (isDuplicateNameError(err)) {
        setError('name', {
          message: t('pages.programs.createDialog.toast.duplicateName', { name: values.name }),
        })
      } else {
        showError(t('pages.programs.createDialog.toast.error'))
      }
    }
  }

  const nameErrorMessage = getProgramNameErrorMessage(errors.name?.message, t)
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="program-name">
          {t('pages.programs.createDialog.fields.name')}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </Label>
        <Input
          id="program-name"
          placeholder={t('pages.programs.createDialog.fields.namePlaceholder')}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'program-name-error' : undefined}
          {...register('name')}
        />
        {nameErrorMessage && (
          <p
            id="program-name-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {nameErrorMessage}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={close}
          disabled={isPending}
        >
          {t('pages.programs.createDialog.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.programs.createDialog.submit')}
        </Button>
      </div>
    </form>
  )
}
