import { useTranslation } from 'react-i18next'

import { useGetBusinessCase, useGetBusinessCaseByProjectId } from '@/entities/business-case'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import type { BusinessCaseFormValues } from '../utils/businessCaseSchema'
import { useCreateBusinessCase } from './useCreateBusinessCase'
import { useSubmitBusinessCase } from './useSubmitBusinessCase'
import { useUpdateBusinessCase } from './useUpdateBusinessCase'

// Empty strings become undefined so the mutation omits the field rather than clearing it.
function toMutationFields(values: BusinessCaseFormValues) {
  return {
    clientSummary: values.clientSummary || undefined,
    projectRationale: values.projectRationale || undefined,
    expectedBenefit: values.expectedBenefit || undefined,
    options: values.options || undefined,
    investmentCalculation: values.investmentCalculation || undefined,
    keyRisks: values.keyRisks || undefined,
    expectedNegativeSideEffect: values.expectedNegativeSideEffect || undefined,
    timeline: values.timeline || undefined,
  }
}

interface UseBusinessCaseDialogActionsProps {
  projectId: string
  onClose: () => void
}

/**
 * Encapsulates queries, mutations, and submit handlers for the BusinessCaseDialog.
 * Keeps business logic out of the dialog render layer.
 *
 * @param props - Hook configuration.
 * @param props.projectId - The project whose Business Case this hook manages.
 * @param props.onClose - Callback to close the dialog; called after a successful create or submit.
 * @returns Combined state flags and action handlers for the dialog.
 */
export function useBusinessCaseDialogActions({
  projectId,
  onClose,
}: UseBusinessCaseDialogActionsProps) {
  const { t } = useTranslation()

  const { data: bcSummary, isPending: isSummaryLoading } = useGetBusinessCaseByProjectId(projectId)
  const { data: bc, isPending: isBcLoading } = useGetBusinessCase(bcSummary?.id ?? '')

  const { mutateAsync: createBC, isPending: isCreating } = useCreateBusinessCase()
  const { mutateAsync: updateBC, isPending: isUpdating } = useUpdateBusinessCase()
  const { mutateAsync: submitBC, isPending: isSubmitting } = useSubmitBusinessCase()

  const isLoading = isSummaryLoading || (!!bcSummary?.id && isBcLoading)
  const isSavePending = isCreating || isUpdating
  const hasExisting = !!bcSummary
  const isSubmitted = !!bc && bc.status !== 'draft'
  const isAccepted = !!bc && bc.status === 'accepted'

  function handleSaveDraft(values: BusinessCaseFormValues) {
    if (!hasExisting) {
      showPromise(
        (async () => {
          await createBC({ projectId, ...toMutationFields(values) })
          onClose()
        })(),
        {
          loading: t('pages.businessCase.toast.creating'),
          success: t('pages.businessCase.toast.createSuccess'),
          error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.createError')),
        },
      )
    } else {
      if (!bc) return
      showPromise(updateBC({ id: bc.id, version: bc.version, ...toMutationFields(values) }), {
        loading: t('pages.businessCase.toast.updating'),
        success: t('pages.businessCase.toast.updateSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.updateError')),
      })
    }
  }

  function handleMarkComplete(values: BusinessCaseFormValues) {
    if (!hasExisting) {
      showPromise(
        (async () => {
          const created = await createBC({ projectId, ...toMutationFields(values) })
          await submitBC({ id: created.id, version: created.version })
          onClose()
        })(),
        {
          loading: t('pages.businessCase.toast.submitting'),
          success: t('pages.businessCase.toast.submitSuccess'),
          error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.submitError')),
        },
      )
    } else {
      if (!bc) return
      showPromise(
        (async () => {
          const updated = await updateBC({
            id: bc.id,
            version: bc.version,
            ...toMutationFields(values),
          })
          await submitBC({ id: updated.id, version: updated.version })
          onClose()
        })(),
        {
          loading: t('pages.businessCase.toast.submitting'),
          success: t('pages.businessCase.toast.submitSuccess'),
          error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.submitError')),
        },
      )
    }
  }

  return {
    bc,
    isLoading,
    isSavePending,
    isSubmitting,
    hasExisting,
    isSubmitted,
    isAccepted,
    handleSaveDraft,
    handleMarkComplete,
    markCompleteHandler: isSubmitted ? undefined : handleMarkComplete,
  }
}
