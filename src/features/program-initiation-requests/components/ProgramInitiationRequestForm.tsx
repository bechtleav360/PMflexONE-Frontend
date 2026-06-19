import { useImperativeHandle } from 'react'
import type { Ref } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useProgramInitiationRequestForm } from '../hooks/useProgramInitiationRequestForm'
import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'
import { ProgramInitiationRequestMandatoryFields } from './ProgramInitiationRequestMandatoryFields'
import { ProgramInitiationRequestOptionalFields } from './ProgramInitiationRequestOptionalFields'

type FormMode = 'create' | 'edit' | 'view'

/** Imperative handle exposed via ref for external save-draft triggers (e.g. a Dialog footer). */
export interface ProgramInitiationRequestFormHandle {
  /** Validates the form with the draft schema and, if valid, calls `onSaveDraft`. */
  saveDraft: () => void
}

interface ProgramInitiationRequestFormProps {
  mode: FormMode
  defaultValues?: Partial<ProgramInitiationRequestFormValues>
  onSaveDraft?: (values: ProgramInitiationRequestFormValues) => void
  onSubmit: (values: ProgramInitiationRequestFormValues) => void
  isPending: boolean
  formId?: string
  hideActions?: boolean
  ref?: Ref<ProgramInitiationRequestFormHandle>
  /** Display name of the requesting program (shown as a read-only field). */
  programName: string
  /** Portfolio name to display as a read-only field in view mode; null when not set. */
  portfolioName?: string | null
}

/**
 * Shared form for creating, editing, and viewing a program initiation request.
 * Used inside `ProgramInitiationRequestDialog` for all modes.
 *
 * @param props - Component props.
 * @param props.mode - `'create'`, `'edit'`, or `'view'`.
 * @param props.defaultValues - Pre-populated field values.
 * @param props.onSaveDraft - Draft-save callback; absent → button hidden.
 * @param props.onSubmit - Submit callback.
 * @param props.isPending - Disables all action buttons while a mutation is in flight.
 * @param props.formId - HTML `id` for the `<form>` element.
 * @param props.hideActions - Hides the built-in action buttons.
 * @param props.ref - Ref to the form handle exposing `saveDraft()`.
 * @param props.programName - Display name of the requesting program (read-only field).
 * @param props.portfolioName - Portfolio name shown as a read-only field in view mode.
 * @returns The program PIR form.
 */
export function ProgramInitiationRequestForm({
  mode,
  defaultValues,
  onSaveDraft,
  onSubmit,
  isPending,
  formId,
  hideActions = false,
  ref,
  programName,
  portfolioName = null,
}: ProgramInitiationRequestFormProps) {
  const { t } = useTranslation()
  const isView = mode === 'view'
  const disabled = isView || isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    actionRef,
  } = useProgramInitiationRequestForm(defaultValues)

  useImperativeHandle(
    ref,
    () => ({
      saveDraft: () => {
        if (!onSaveDraft) return
        actionRef.current = 'draft'
        void handleSubmit(onSaveDraft)()
      },
    }),
    [actionRef, handleSubmit, onSaveDraft],
  )

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        actionRef.current = 'submit'
        void handleSubmit(onSubmit)(e)
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <ProgramInitiationRequestMandatoryFields
        register={register}
        control={control}
        errors={errors}
        disabled={disabled}
        isView={isView}
        isCreate={mode === 'create'}
        programName={programName}
        portfolioName={portfolioName}
      />

      <ProgramInitiationRequestOptionalFields
        register={register}
        control={control}
        errors={errors}
        disabled={disabled}
        isView={isView}
      />

      {!isView && !hideActions && (
        <div className="flex justify-end gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                actionRef.current = 'draft'
                void handleSubmit(onSaveDraft)()
              }}
            >
              {t('pages.initiationRequests.form.saveDraftButton')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
          >
            {t('pages.initiationRequests.form.submitButton')}
          </Button>
        </div>
      )}
    </form>
  )
}
