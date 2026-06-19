import { useTranslation } from 'react-i18next'

import type { ProjectCharterNode } from '@/entities/project-charter'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { formValuesToMutationFields } from '../utils/projectCharterMappers'
import type { ProjectCharterFormValues } from '../utils/projectCharterSchema'
import { useCreateProjectCharter } from './useCreateProjectCharter'
import { useSubmitProjectCharter } from './useSubmitProjectCharter'
import { useUpdateProjectCharter } from './useUpdateProjectCharter'

/**
 * Encapsulates save and submit actions for the project-charter dialog.
 * Handles both create (no existing charter) and update (existing charter) flows,
 * chaining an update + submit when submitting from an existing draft.
 *
 * @param projectId - The project to scope charter operations to.
 * @param charterSummary - Lightweight charter summary (id only), or `null` if none exists.
 * @param charter - Full charter node, or `undefined` while loading.
 * @param onClose - Callback invoked after a successful action to close the dialog.
 * @returns Action handlers and their pending flags.
 */
export function useProjectCharterDialogActions(
  projectId: string,
  charterSummary: { id: string } | null | undefined,
  charter: ProjectCharterNode | undefined,
  onClose: () => void,
) {
  const { t } = useTranslation()
  const { mutateAsync: createCharter, isPending: isCreating } = useCreateProjectCharter()
  const { mutateAsync: updateCharter, isPending: isUpdating } = useUpdateProjectCharter()
  const { mutateAsync: submitCharter, isPending: isSubmitting } = useSubmitProjectCharter()

  const hasExisting = !!charterSummary

  function handleSave(values: ProjectCharterFormValues) {
    if (!hasExisting) {
      showPromise(
        (async () => {
          await createCharter({ projectId, ...formValuesToMutationFields(values) })
          onClose()
        })(),
        {
          loading: t('pages.projectCharter.toast.creating'),
          success: t('pages.projectCharter.toast.createSuccess'),
          error: (err) => getGraphQLErrorMessage(err, t('pages.projectCharter.toast.createError')),
        },
      )
    } else {
      if (!charter) return
      showPromise(
        updateCharter({
          id: charter.id,
          version: charter.version,
          ...formValuesToMutationFields(values),
        }),
        {
          loading: t('pages.projectCharter.toast.updating'),
          success: t('pages.projectCharter.toast.updateSuccess'),
          error: (err) => getGraphQLErrorMessage(err, t('pages.projectCharter.toast.updateError')),
        },
      )
    }
  }

  function handleSubmit(values: ProjectCharterFormValues) {
    const submitToast = {
      loading: t('pages.projectCharter.toast.submitting'),
      success: t('pages.projectCharter.toast.submitSuccess'),
      error: (err: unknown) =>
        getGraphQLErrorMessage(err, t('pages.projectCharter.toast.submitError')),
    }
    if (!hasExisting) {
      showPromise(
        (async () => {
          const created = await createCharter({ projectId, ...formValuesToMutationFields(values) })
          await submitCharter({ id: created.id, version: created.version })
          onClose()
        })(),
        submitToast,
      )
    } else {
      if (!charter) return
      showPromise(
        (async () => {
          const updated = await updateCharter({
            id: charter.id,
            version: charter.version,
            ...formValuesToMutationFields(values),
          })
          await submitCharter({ id: updated.id, version: updated.version })
          onClose()
        })(),
        submitToast,
      )
    }
  }

  return {
    handleSave,
    handleSubmit,
    isSavePending: isCreating || isUpdating,
    isSubmitPending: isSubmitting,
  }
}
