import { useImperativeHandle } from 'react'
import type { Ref } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

import { useProjectInitiationRequestForm } from '../hooks/useProjectInitiationRequestForm'
import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'
import { ProjectInitiationRequestMandatoryFields } from './ProjectInitiationRequestMandatoryFields'
import { ProjectInitiationRequestOptionalFields } from './ProjectInitiationRequestOptionalFields'

type FormMode = 'create' | 'edit' | 'view'

/** Imperative handle exposed via ref for external save-draft triggers (e.g. a Dialog footer). */
export interface ProjectInitiationRequestFormHandle {
  /** Validates the form with the draft schema and, if valid, calls `onSaveDraft`. */
  saveDraft: () => void
}

interface ProjectInitiationRequestFormProps {
  /** Controls the interactive mode of the form. */
  mode: FormMode
  /** Pre-populated values for edit/view mode. */
  defaultValues?: Partial<ProjectInitiationRequestFormValues>
  /**
   * Called after draft-schema validation passes when the user saves a draft.
   * When omitted, the "Save as Draft" button is not rendered.
   */
  onSaveDraft?: (values: ProjectInitiationRequestFormValues) => void
  /** Called after submit-schema validation passes when the user submits the form. */
  onSubmit: (values: ProjectInitiationRequestFormValues) => void
  /** When true, action buttons are disabled and show a loading state. */
  isPending: boolean
  /** HTML `id` applied to the `<form>` element — pair with `type="submit" form="<id>"` on external buttons. */
  formId?: string
  /** When true, the built-in action buttons are not rendered. Pair with `ref.saveDraft()` for external triggers. */
  hideActions?: boolean
  /** When true, the requesting-project selector is locked (pre-set by project context). */
  projectLocked?: boolean
  /** Ref exposing `saveDraft()` so a Dialog footer can trigger draft-save without a DOM id lookup. */
  ref?: Ref<ProjectInitiationRequestFormHandle>
}

/**
 * Shared form for creating, editing, and viewing a project initiation request.
 * Used inside `ProjectInitiationRequestDialog` (all modes) and on
 * `ProjectInitiationRequestDetailPage` (edit/view mode).
 *
 * In `view` mode all fields are read-only and action buttons are hidden.
 * In `create`/`edit` mode "Submit Request" is always shown; "Save as Draft" appears
 * only when `onSaveDraft` is provided. Draft-save uses `draftSchema`; submit uses `submitSchema`.
 *
 * When `hideActions` is true, pass a `ref` and call `ref.current.saveDraft()` from
 * an external button (e.g. a Dialog footer) instead of the built-in buttons.
 *
 * @param props - Component props.
 * @param props.mode - `'create'`, `'edit'`, or `'view'`.
 * @param props.defaultValues - Pre-populated field values.
 * @param props.onSaveDraft - Draft-save callback; absent → button hidden.
 * @param props.onSubmit - Submit callback.
 * @param props.isPending - Disables all action buttons while a mutation is in flight.
 * @param props.formId - HTML `id` for the `<form>` element.
 * @param props.hideActions - Hides the built-in action buttons.
 * @param props.projectLocked - When true, the requesting-project selector is locked.
 * @param props.ref - Ref to the form handle exposing `saveDraft()`.
 * @returns The PIR form.
 */
export function ProjectInitiationRequestForm({
  mode,
  defaultValues,
  onSaveDraft,
  onSubmit,
  isPending,
  formId,
  hideActions = false,
  projectLocked = false,
  ref,
}: ProjectInitiationRequestFormProps) {
  const { t } = useTranslation()
  const isView = mode === 'view'
  const disabled = isView || isPending

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    actionRef,
  } = useProjectInitiationRequestForm(defaultValues)

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
      <ProjectInitiationRequestMandatoryFields
        register={register}
        control={control}
        errors={errors}
        disabled={disabled}
        isView={isView}
        projectLocked={projectLocked}
      />

      <ProjectInitiationRequestOptionalFields
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
