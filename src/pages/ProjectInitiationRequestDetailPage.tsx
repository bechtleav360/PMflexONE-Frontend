import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'
import { useGetProjectInitiationRequest } from '@/entities/project-initiation-request'
import {
  ProjectInitiationRequestForm,
  useSubmitProjectInitiationRequest,
  useUpdateProjectInitiationRequest,
} from '@/features/project-initiation-requests'
import type { ProjectInitiationRequestFormValues } from '@/features/project-initiation-requests'
import { Alert, AlertDescription, AlertTitle, showPromise, Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'
import { PageContent } from '@/widgets/Layout'

import { ProjectInitiationRequestAcceptedView } from './ProjectInitiationRequestAcceptedView'

function pirToDefaultValues(
  pir: ProjectInitiationRequest,
): Partial<ProjectInitiationRequestFormValues> {
  return {
    name: pir.name,
    documentVersion: pir.documentVersion ?? '',
    requestingProjectId: pir.requestingProject?.item.id ?? '',
    scopeType: pir.scope?.scopeType as ProjectInitiationRequestFormValues['scopeType'] | undefined,
    scopeId: pir.scope?.id ?? '',
    projectInitiator: pir.projectInitiator,
    projectOwner: pir.projectOwner,
    organizationalUnit: pir.organizationalUnit,
    solutionProvider: pir.solutionProvider,
    approvalAuthority: pir.approvalAuthority,
    requestDate: pir.requestDate,
    estimatedEffort: pir.estimatedEffort,
    estimatedEffortComment: pir.estimatedEffortComment ?? '',
    targetDeliveryDate: pir.targetDeliveryDate,
    deliveryType: pir.deliveryType as ProjectInitiationRequestFormValues['deliveryType'],
  }
}

function buildUpdateInput(values: ProjectInitiationRequestFormValues, version: number) {
  return {
    version,
    name: values.name,
    requestingProjectId: values.requestingProjectId,
    documentVersion: values.documentVersion || undefined,
    projectInitiator: values.projectInitiator ?? undefined,
    projectOwner: values.projectOwner ?? undefined,
    organizationalUnit: values.organizationalUnit ?? undefined,
    solutionProvider: values.solutionProvider ?? undefined,
    approvalAuthority: values.approvalAuthority ?? undefined,
    requestDate: values.requestDate,
    estimatedEffort: values.estimatedEffort,
    estimatedEffortComment: values.estimatedEffortComment || undefined,
    targetDeliveryDate: values.targetDeliveryDate,
    deliveryType: values.deliveryType ?? undefined,
  }
}

/**
 * Detail page for a single project initiation request.
 *
 * - status `draft`     → editable form with Save as Draft + Submit actions.
 * - status `submitted` → read-only form (view mode).
 * - status `accepted`  → delegates to {@link ProjectInitiationRequestAcceptedView}.
 *
 * Route: `/initiation-requests/:id`
 *
 * @returns The initiation request detail page.
 */
export function ProjectInitiationRequestDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()

  const { data: pir, isPending, isError } = useGetProjectInitiationRequest(id)
  const { mutateAsync: updatePIR, isPending: isUpdating } = useUpdateProjectInitiationRequest()
  const { mutateAsync: submitPIR, isPending: isSubmitting } = useSubmitProjectInitiationRequest()

  const isMutating = isUpdating || isSubmitting

  function handleSaveDraft(values: ProjectInitiationRequestFormValues) {
    if (!pir) return
    showPromise(updatePIR({ id: pir.id, input: buildUpdateInput(values, pir.version) }), {
      loading: t('pages.initiationRequests.toast.updating'),
      success: t('pages.initiationRequests.toast.updateSuccess'),
      error: (err) => getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.updateError')),
    })
  }

  function handleSubmit(values: ProjectInitiationRequestFormValues) {
    if (!pir) return
    showPromise(
      (async () => {
        await updatePIR({ id: pir.id, input: buildUpdateInput(values, pir.version) })
        await submitPIR({ id: pir.id, version: pir.version + 1 })
      })(),
      {
        loading: t('pages.initiationRequests.toast.submitting'),
        success: t('pages.initiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.submitError')),
      },
    )
  }

  if (isPending) {
    return (
      <PageContent>
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageContent>
    )
  }

  if (isError || !pir) {
    return (
      <PageContent>
        <Alert variant="destructive">
          <AlertTitle>{t('pages.initiationRequests.detail.title')}</AlertTitle>
          <AlertDescription>{t('pages.initiationRequests.detail.loadError')}</AlertDescription>
        </Alert>
      </PageContent>
    )
  }

  if (pir.status === 'accepted') {
    return <ProjectInitiationRequestAcceptedView pir={pir} />
  }

  const isView = pir.status === 'submitted'
  const title = isView
    ? t('pages.initiationRequests.detail.title')
    : t('pages.initiationRequests.detail.editTitle')

  return (
    <PageContent>
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/initiation-requests"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.initiationRequests.detail.backToList')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{pir.name}</span>
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-6">
        <ProjectInitiationRequestForm
          mode={isView ? 'view' : 'edit'}
          defaultValues={pirToDefaultValues(pir)}
          onSaveDraft={isView ? undefined : handleSaveDraft}
          onSubmit={handleSubmit}
          isPending={isMutating}
        />
      </div>
    </PageContent>
  )
}
