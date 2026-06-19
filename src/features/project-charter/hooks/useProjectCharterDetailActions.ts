import { useTranslation } from 'react-i18next'

import type { ProjectCharterNode } from '@/entities/project-charter'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { formValuesToMutationFields } from '../utils/projectCharterMappers'
import type { ProjectCharterFormValues } from '../utils/projectCharterSchema'
import { useSubmitProjectCharter } from './useSubmitProjectCharter'
import { useUpdateProjectCharter } from './useUpdateProjectCharter'

/**
 * Save and submit action handlers for the Project Charter detail page.
 * Chains update → submit when the user submits from an existing draft.
 *
 * @param pc - The current project charter node, or `undefined` while loading.
 * @returns Action handlers and their pending flags.
 */
export function useProjectCharterDetailActions(pc: ProjectCharterNode | undefined) {
  const { t } = useTranslation()
  const { mutateAsync: updatePC, isPending: isUpdating } = useUpdateProjectCharter()
  const { mutateAsync: submitPC, isPending: isSubmitting } = useSubmitProjectCharter()

  function handleSave(values: ProjectCharterFormValues) {
    if (!pc) return
    showPromise(
      updatePC({ id: pc.id, version: pc.version, ...formValuesToMutationFields(values) }),
      {
        loading: t('pages.projectCharter.toast.updating'),
        success: t('pages.projectCharter.toast.updateSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.projectCharter.toast.updateError')),
      },
    )
  }

  function handleSubmit(values: ProjectCharterFormValues) {
    if (!pc) return
    showPromise(
      updatePC({ id: pc.id, version: pc.version, ...formValuesToMutationFields(values) }).then(
        (updated) => submitPC({ id: updated.id, version: updated.version }),
      ),
      {
        loading: t('pages.projectCharter.toast.submitting'),
        success: t('pages.projectCharter.toast.submitSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.projectCharter.toast.submitError')),
      },
    )
  }

  return { handleSave, handleSubmit, isUpdating, isSubmitting }
}
