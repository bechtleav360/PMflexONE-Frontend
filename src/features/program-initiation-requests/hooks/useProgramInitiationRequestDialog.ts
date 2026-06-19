import { useTranslation } from 'react-i18next'

import type { ProgramInitiationRequest } from '@/entities/program-initiation-request'
import {
  useGetProgramInitiationRequest,
  useGetProgramInitiationRequestByProgramId,
} from '@/entities/program-initiation-request'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'
import { useCreateProgramInitiationRequest } from './useCreateProgramInitiationRequest'
import { useSubmitProgramInitiationRequest } from './useSubmitProgramInitiationRequest'
import { useUpdateProgramInitiationRequest } from './useUpdateProgramInitiationRequest'

type DialogMode = 'create' | 'edit' | 'view'

/** State and callbacks returned by {@link useProgramInitiationRequestDialog}. */
export interface UseProgramInitiationRequestDialogReturn {
  isLoading: boolean
  isMutating: boolean
  mode: DialogMode
  dialogTitle: string
  pirStatus: string | null
  portfolioName: string | null
  defaultValues: Partial<ProgramInitiationRequestFormValues>
  onFormSubmit: (values: ProgramInitiationRequestFormValues) => void
  onFormSaveDraft: ((values: ProgramInitiationRequestFormValues) => void) | undefined
}

function toUndefined<T>(val: T | null | undefined): T | undefined {
  return val ?? undefined
}

function emptyOrUndefined(val: string | null | undefined): string | undefined {
  return val || undefined
}

function toNull<T>(val: T | null | undefined): T | null {
  return val ?? null
}

function buildCreateInput(values: ProgramInitiationRequestFormValues, programId: string) {
  return {
    name: values.name,
    requestingProgramId: programId,
    portfolioId: values.portfolioId ?? '',
    documentVersion: emptyOrUndefined(values.documentVersion),
    projectInitiator: toUndefined(values.projectInitiator),
    projectOwner: toUndefined(values.projectOwner),
    organizationalUnit: toUndefined(values.organizationalUnit),
    solutionProvider: toUndefined(values.solutionProvider),
    approvalAuthority: toUndefined(values.approvalAuthority),
    requestDate: toUndefined(values.requestDate),
    estimatedEffort: toUndefined(values.estimatedEffort),
    estimatedEffortComment: emptyOrUndefined(values.estimatedEffortComment),
    targetDeliveryDate: toUndefined(values.targetDeliveryDate),
    deliveryType: toUndefined(values.deliveryType),
  }
}

function buildUpdateInput(values: ProgramInitiationRequestFormValues, version: number) {
  return {
    version,
    name: values.name,
    requestingProgramId: values.requestingProgramId,
    documentVersion: emptyOrUndefined(values.documentVersion),
    projectInitiator: toUndefined(values.projectInitiator),
    projectOwner: toUndefined(values.projectOwner),
    organizationalUnit: toUndefined(values.organizationalUnit),
    solutionProvider: toUndefined(values.solutionProvider),
    approvalAuthority: toUndefined(values.approvalAuthority),
    requestDate: values.requestDate,
    estimatedEffort: values.estimatedEffort,
    estimatedEffortComment: emptyOrUndefined(values.estimatedEffortComment),
    targetDeliveryDate: values.targetDeliveryDate,
    deliveryType: toUndefined(values.deliveryType),
  }
}

function buildDefaultValues(
  pir: ProgramInitiationRequest | undefined,
  programId: string,
  portfolioId: string,
): Partial<ProgramInitiationRequestFormValues> {
  if (!pir) return { requestingProgramId: programId, portfolioId }
  return {
    name: pir.name,
    documentVersion: pir.documentVersion ?? '',
    requestingProgramId: pir.requestingProgram?.item.id ?? programId,
    portfolioId: pir.portfolio?.item.id ?? '',
    projectInitiator: toNull(pir.projectInitiator),
    projectOwner: toNull(pir.projectOwner),
    organizationalUnit: toNull(pir.organizationalUnit),
    solutionProvider: toNull(pir.solutionProvider),
    approvalAuthority: toNull(pir.approvalAuthority),
    requestDate: toNull(pir.requestDate),
    estimatedEffort: toNull(pir.estimatedEffort),
    estimatedEffortComment: pir.estimatedEffortComment ?? '',
    targetDeliveryDate: toNull(pir.targetDeliveryDate),
    deliveryType: pir.deliveryType,
  }
}

function deriveMode(hasSummary: boolean, pirStatus: string | undefined): DialogMode {
  if (!hasSummary) return 'create'
  return pirStatus === 'draft' ? 'edit' : 'view'
}

function pirId(summary: { id: string } | undefined): string {
  return summary?.id ?? ''
}

function pirPortfolioName(pir: ProgramInitiationRequest | undefined): string | null {
  return pir?.portfolio?.item.name ?? null
}

const TITLE_KEY: Record<DialogMode, string> = {
  create: 'pages.programInitiationRequests.dialog.createTitle',
  edit: 'pages.programInitiationRequests.detail.editTitle',
  view: 'pages.programInitiationRequests.detail.title',
}

function usePIRDialogActions(
  programId: string,
  _portfolioId: string,
  mode: DialogMode,
  pir: ProgramInitiationRequest | undefined,
  onClose: () => void,
) {
  const { t } = useTranslation()
  const { mutateAsync: createPIR, isPending: isCreating } = useCreateProgramInitiationRequest()
  const { mutateAsync: submitPIR, isPending: isSubmitting } = useSubmitProgramInitiationRequest()
  const { mutateAsync: updatePIR, isPending: isUpdating } = useUpdateProgramInitiationRequest()

  function handleCreateSubmit(values: ProgramInitiationRequestFormValues) {
    showPromise(
      (async () => {
        const created = await createPIR(buildCreateInput(values, programId))
        await submitPIR({ id: created.id, version: created.version })
        onClose()
      })(),
      {
        loading: t('pages.programInitiationRequests.toast.submitting'),
        success: t('pages.programInitiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.programInitiationRequests.toast.submitError')),
      },
    )
  }

  function handleCreateSaveDraft(values: ProgramInitiationRequestFormValues) {
    showPromise(
      (async () => {
        await createPIR(buildCreateInput(values, programId))
        onClose()
      })(),
      {
        loading: t('pages.programInitiationRequests.toast.creating'),
        success: t('pages.programInitiationRequests.toast.createSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.programInitiationRequests.toast.createError')),
      },
    )
  }

  function handleEditSaveDraft(values: ProgramInitiationRequestFormValues) {
    if (!pir) return
    showPromise(updatePIR({ id: pir.id, input: buildUpdateInput(values, pir.version) }), {
      loading: t('pages.programInitiationRequests.toast.updating'),
      success: t('pages.programInitiationRequests.toast.updateSuccess'),
      error: (err) =>
        getGraphQLErrorMessage(err, t('pages.programInitiationRequests.toast.updateError')),
    })
  }

  function handleEditSubmit(values: ProgramInitiationRequestFormValues) {
    if (!pir) return
    showPromise(
      (async () => {
        const updated = await updatePIR({
          id: pir.id,
          input: buildUpdateInput(values, pir.version),
        })
        await submitPIR({ id: pir.id, version: updated.version })
        onClose()
      })(),
      {
        loading: t('pages.programInitiationRequests.toast.submitting'),
        success: t('pages.programInitiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.programInitiationRequests.toast.submitError')),
      },
    )
  }

  const submitHandlers: Record<DialogMode, (values: ProgramInitiationRequestFormValues) => void> = {
    create: handleCreateSubmit,
    edit: handleEditSubmit,
    view: () => {},
  }
  const saveDraftHandlers: Record<
    DialogMode,
    ((values: ProgramInitiationRequestFormValues) => void) | undefined
  > = { create: handleCreateSaveDraft, edit: handleEditSaveDraft, view: undefined }

  return {
    isMutating: isCreating || isSubmitting || isUpdating,
    onFormSubmit: submitHandlers[mode],
    onFormSaveDraft: saveDraftHandlers[mode],
  }
}

/**
 * Manages the state and handlers for the program initiation request dialog.
 * Encapsulates data fetching, mutations, mode derivation, and form callbacks.
 *
 * @param programId - The program to scope the PIR lookup and creation to.
 * @param portfolioId - The portfolio ID required by the create mutation.
 * @param onClose - Callback invoked after a successful create or submit mutation.
 * @returns Dialog state and form callbacks ready for consumption by the dialog component.
 */
export function useProgramInitiationRequestDialog(
  programId: string,
  portfolioId: string,
  onClose: () => void,
): UseProgramInitiationRequestDialogReturn {
  const { t } = useTranslation()
  const { data: pirSummary, isPending: isSummaryLoading } =
    useGetProgramInitiationRequestByProgramId(programId)
  const summaryId = pirId(pirSummary ?? undefined)
  const { data: pir, isPending: isPirLoading } = useGetProgramInitiationRequest(summaryId)
  const isLoading = isSummaryLoading || (!!summaryId && isPirLoading)
  const mode = deriveMode(!!pirSummary, pir?.status ?? undefined)
  const { isMutating, onFormSubmit, onFormSaveDraft } = usePIRDialogActions(
    programId,
    portfolioId,
    mode,
    pir,
    onClose,
  )

  return {
    isLoading,
    isMutating,
    mode,
    dialogTitle: t(TITLE_KEY[mode]),
    pirStatus: pir?.status ?? null,
    portfolioName: pirPortfolioName(pir),
    defaultValues: buildDefaultValues(pir, programId, portfolioId),
    onFormSubmit,
    onFormSaveDraft,
  }
}
