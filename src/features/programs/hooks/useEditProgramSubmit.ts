import type { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { showError, showSuccess } from '@/shared/components'

import { isDuplicateNameError, isVersionConflictError } from '../api/programsApi'
import { useEditProgramDialogStore } from '../store/useEditProgramDialogStore'
import type { Program } from '../types/program.types'
import type { EditProgramFormValues } from '../utils/programSchema'
import { useUpdateProgram } from './useUpdateProgram'

/** Options for {@link useEditProgramSubmit}. */
interface UseEditProgramSubmitOptions {
  /** The program being edited. */
  program: Program
  /** React Hook Form setter for field-level errors. */
  setError: UseFormSetError<EditProgramFormValues>
  /** Called when the server rejects the update due to an optimistic-lock conflict. */
  onVersionConflict?: () => void
}

/**
 * Encapsulates the submit handler and dialog close action for the edit program form.
 *
 * @param options - Options.
 * @param options.program - The program being edited.
 * @param options.setError - React Hook Form setter for field-level errors.
 * @param options.onVersionConflict - Called when the server rejects the update due to a version conflict.
 * @returns The async submit handler, pending state, and dialog close function.
 */
export function useEditProgramSubmit({
  program,
  setError,
  onVersionConflict,
}: UseEditProgramSubmitOptions) {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useUpdateProgram()
  const close = useEditProgramDialogStore((s) => s.close)

  async function onSubmit(values: EditProgramFormValues) {
    try {
      await mutateAsync({
        id: program.id,
        input: {
          // Intentional: snapshot version at dialog open. Concurrent edits surface as
          // version-conflict errors handled by onVersionConflict.
          version: program.version,
          name: values.name,
          status: values.status,
          portfolioId: values.portfolioId ?? null,
          metadata: values.metadata ?? null,
        },
      })
      close()
      showSuccess(t('pages.programs.editDialog.toast.success'))
    } catch (err) {
      if (isVersionConflictError(err)) {
        onVersionConflict?.()
      } else if (isDuplicateNameError(err)) {
        setError('name', {
          message: t('pages.programs.editDialog.toast.duplicateName', { name: values.name }),
        })
      } else {
        showError(t('pages.programs.editDialog.toast.error'))
      }
    }
  }

  return { onSubmit, isPending, close }
}
