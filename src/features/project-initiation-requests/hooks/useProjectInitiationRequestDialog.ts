import { useTranslation } from 'react-i18next'

import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'
import {
  useGetProjectInitiationRequest,
  useGetProjectInitiationRequestByProjectId,
} from '@/entities/project-initiation-request'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'
import { useCreateProjectInitiationRequest } from './useCreateProjectInitiationRequest'
import { useSubmitProjectInitiationRequest } from './useSubmitProjectInitiationRequest'
import { useUpdateProjectInitiationRequest } from './useUpdateProjectInitiationRequest'

type DialogMode = 'create' | 'edit' | 'view'

/**
 * State and callbacks returned by {@link useProjectInitiationRequestDialog}.
 */
export interface UseProjectInitiationRequestDialogReturn {
  /** True while initial data is being fetched. */
  isLoading: boolean
  /** True while any mutation is in flight. */
  isMutating: boolean
  /** Current interaction mode derived from the PIR lifecycle status. */
  mode: DialogMode
  /** Translated title for the dialog header. */
  dialogTitle: string
  /** Raw PIR status string, or null when no PIR exists yet (create mode). */
  pirStatus: string | null
  /** Default form values populated from the existing PIR, or just the project ID for create mode. */
  defaultValues: Partial<ProjectInitiationRequestFormValues>
  /** Routes to create-submit or update-submit depending on mode. */
  onFormSubmit: (values: ProjectInitiationRequestFormValues) => void
  /** Routes to create-draft or update-draft depending on mode. Undefined in view mode. */
  onFormSaveDraft: ((values: ProjectInitiationRequestFormValues) => void) | undefined
}

// Null-coercion and derivation helpers isolate conditional logic so callers stay under the complexity threshold.

function toUndefined<T>(val: T | null | undefined): T | undefined {
  return val ?? undefined
}

function emptyOrUndefined(val: string | null | undefined): string | undefined {
  return val || undefined
}

function toNull<T>(val: T | null | undefined): T | null {
  return val ?? null
}

function deriveScopeFromPir(pir: ProjectInitiationRequest): {
  scopeType: 'Program' | 'Portfolio' | undefined
  scopeId: string
} {
  const raw = pir.scope?.scopeType
  const scopeType = raw === 'Program' || raw === 'Portfolio' ? raw : undefined
  return { scopeType, scopeId: pir.scope?.id ?? '' }
}

// Mutation input builders.

function buildCreateInput(values: ProjectInitiationRequestFormValues, projectId: string) {
  return {
    name: values.name,
    requestingProjectId: projectId,
    scopeType: values.scopeType,
    scopeId: values.scopeId,
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

function buildUpdateInput(values: ProjectInitiationRequestFormValues, version: number) {
  return {
    version,
    name: values.name,
    requestingProjectId: values.requestingProjectId,
    scopeType: values.scopeType,
    scopeId: values.scopeId,
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
  pir: ProjectInitiationRequest | undefined,
  projectId: string,
): Partial<ProjectInitiationRequestFormValues> {
  if (!pir) return { requestingProjectId: projectId }
  const { scopeType, scopeId } = deriveScopeFromPir(pir)

  return {
    name: pir.name,
    documentVersion: pir.documentVersion ?? '',
    requestingProjectId: pir.requestingProject?.item.id ?? projectId,
    scopeType,
    scopeId,
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

// Lookup map avoids ternary chains for dialog titles, keeping the hook under the complexity limit.
const TITLE_KEY: Record<DialogMode, string> = {
  create: 'pages.initiationRequests.dialog.createTitle',
  edit: 'pages.initiationRequests.detail.editTitle',
  view: 'pages.initiationRequests.detail.title',
}

function usePIRDialogActions(
  projectId: string,
  mode: DialogMode,
  pir: ProjectInitiationRequest | undefined,
  onClose: () => void,
) {
  const { t } = useTranslation()
  const { mutateAsync: createPIR, isPending: isCreating } = useCreateProjectInitiationRequest()
  const { mutateAsync: submitPIR, isPending: isSubmitting } = useSubmitProjectInitiationRequest()
  const { mutateAsync: updatePIR, isPending: isUpdating } = useUpdateProjectInitiationRequest()

  function handleCreateSubmit(values: ProjectInitiationRequestFormValues) {
    showPromise(
      (async () => {
        const created = await createPIR(buildCreateInput(values, projectId))
        await submitPIR({ id: created.id, version: created.version })
        onClose()
      })(),
      {
        loading: t('pages.initiationRequests.toast.submitting'),
        success: t('pages.initiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.submitError')),
      },
    )
  }

  function handleCreateSaveDraft(values: ProjectInitiationRequestFormValues) {
    showPromise(
      (async () => {
        await createPIR(buildCreateInput(values, projectId))
        onClose()
      })(),
      {
        loading: t('pages.initiationRequests.toast.creating'),
        success: t('pages.initiationRequests.toast.createSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.createError')),
      },
    )
  }

  function handleEditSaveDraft(values: ProjectInitiationRequestFormValues) {
    if (!pir) return
    showPromise(updatePIR({ id: pir.id, input: buildUpdateInput(values, pir.version) }), {
      loading: t('pages.initiationRequests.toast.updating'),
      success: t('pages.initiationRequests.toast.updateSuccess'),
      error: (err) => getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.updateError')),
    })
  }

  function handleEditSubmit(values: ProjectInitiationRequestFormValues) {
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
        loading: t('pages.initiationRequests.toast.submitting'),
        success: t('pages.initiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.submitError')),
      },
    )
  }

  const submitHandlers: Record<DialogMode, (values: ProjectInitiationRequestFormValues) => void> = {
    create: handleCreateSubmit,
    edit: handleEditSubmit,
    view: () => {},
  }
  const saveDraftHandlers: Record<
    DialogMode,
    ((values: ProjectInitiationRequestFormValues) => void) | undefined
  > = { create: handleCreateSaveDraft, edit: handleEditSaveDraft, view: undefined }

  return {
    isMutating: isCreating || isSubmitting || isUpdating,
    onFormSubmit: submitHandlers[mode],
    onFormSaveDraft: saveDraftHandlers[mode],
  }
}

/**
 * Manages the state and handlers for the project initiation request dialog.
 * Encapsulates data fetching, mutations, mode derivation, and form callbacks.
 *
 * @param projectId - The project to scope the PIR lookup and creation to.
 * @param onClose - Callback invoked after a successful create or submit mutation.
 * @returns Dialog state and form callbacks ready for consumption by the dialog component.
 */
export function useProjectInitiationRequestDialog(
  projectId: string,
  onClose: () => void,
): UseProjectInitiationRequestDialogReturn {
  const { t } = useTranslation()
  const { data: pirSummary, isPending: isSummaryLoading } =
    useGetProjectInitiationRequestByProjectId(projectId)
  const { data: pir, isPending: isPirLoading } = useGetProjectInitiationRequest(
    pirSummary?.id ?? '',
  )
  const isLoading = isSummaryLoading || (!!pirSummary?.id && isPirLoading)
  const mode = deriveMode(!!pirSummary, pir?.status ?? undefined)
  const { isMutating, onFormSubmit, onFormSaveDraft } = usePIRDialogActions(
    projectId,
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
    defaultValues: buildDefaultValues(pir, projectId),
    onFormSubmit,
    onFormSaveDraft,
  }
}
