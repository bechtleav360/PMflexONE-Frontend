import { Pencil, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import type { BusinessCaseNode } from '@/entities/business-case'
import { useGetBusinessCase } from '@/entities/business-case'
import { useGetProjectCharterByProjectId } from '@/entities/project-charter'
import {
  BusinessCaseForm,
  BusinessCaseStatusBadge,
  useSubmitBusinessCase,
  useUpdateBusinessCase,
} from '@/features/business-case'
import type { BusinessCaseFormValues } from '@/features/business-case'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ButtonIcon,
  showPromise,
  Skeleton,
} from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'
import { PageContent } from '@/widgets/Layout'

function bcProjectId(bc: BusinessCaseNode | undefined): string {
  return bc?.project?.id ?? ''
}

function charterHref(charterSummary: { id: string } | null | undefined, projectId: string): string {
  return charterSummary
    ? `/project-charters/${charterSummary.id}`
    : `/project-charters/new?projectId=${projectId}`
}

function toFormValues(bc: BusinessCaseNode): BusinessCaseFormValues {
  return {
    clientSummary: bc.clientSummary ?? '',
    projectRationale: bc.projectRationale ?? '',
    expectedBenefit: bc.expectedBenefit ?? '',
    options: bc.options ?? '',
    investmentCalculation: bc.investmentCalculation ?? '',
    keyRisks: bc.keyRisks ?? '',
    expectedNegativeSideEffect: bc.expectedNegativeSideEffect ?? '',
    timeline: bc.timeline ?? '',
  }
}

function toUpdateInput(bc: BusinessCaseNode, values: BusinessCaseFormValues) {
  return {
    id: bc.id,
    version: bc.version,
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

/**
 * Detail page for a single Business Case.
 *
 * - status `draft`     → form with "Save as Draft" + "Mark as Complete" actions.
 * - status `submitted` → form with "Save" action only; "Start Project Charter" entry point shown.
 *
 * Route: `/business-cases/:id`
 *
 * @returns The business case detail page.
 */
export function BusinessCaseDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()

  const { data: bc, isPending, isError } = useGetBusinessCase(id)
  const { mutateAsync: updateBC, isPending: isUpdating } = useUpdateBusinessCase()
  const { mutateAsync: submitBC, isPending: isSubmitting } = useSubmitBusinessCase()
  const { data: charterSummary } = useGetProjectCharterByProjectId(bcProjectId(bc))

  function handleSaveDraft(values: BusinessCaseFormValues) {
    if (!bc) return
    showPromise(updateBC(toUpdateInput(bc, values)), {
      loading: t('pages.businessCase.toast.updating'),
      success: t('pages.businessCase.toast.updateSuccess'),
      error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.updateError')),
    })
  }

  function handleMarkComplete(values: BusinessCaseFormValues) {
    if (!bc) return
    showPromise(
      updateBC(toUpdateInput(bc, values)).then((updated) =>
        submitBC({ id: bc.id, version: updated.version }),
      ),
      {
        loading: t('pages.businessCase.toast.submitting'),
        success: t('pages.businessCase.toast.submitSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.submitError')),
      },
    )
  }

  if (isPending) {
    return (
      <PageContent>
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 w-full"
            />
          ))}
        </div>
      </PageContent>
    )
  }

  if (isError || !bc) {
    return (
      <PageContent>
        <Alert variant="destructive">
          <AlertTitle>{t('pages.businessCase.detailPage.heading')}</AlertTitle>
          <AlertDescription>{t('pages.businessCase.loadError')}</AlertDescription>
        </Alert>
      </PageContent>
    )
  }

  const isSubmitted = bc.status !== 'draft'

  return (
    <PageContent>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{t('pages.businessCase.detailPage.heading')}</h1>
        <BusinessCaseStatusBadge status={bc.status} />
      </div>

      <div className="max-w-2xl">
        <BusinessCaseForm
          mode="edit"
          defaultValues={toFormValues(bc)}
          onSaveDraft={handleSaveDraft}
          onMarkComplete={isSubmitted ? undefined : handleMarkComplete}
          isSavePending={isUpdating}
          isSubmitPending={isSubmitting}
        />

        {isSubmitted && (
          <div className="mt-4">
            <Button asChild>
              <Link to={charterHref(charterSummary, bcProjectId(bc))}>
                <ButtonIcon icon={charterSummary ? Pencil : Plus} />
                {charterSummary
                  ? t('pages.projectCharter.actions.viewEditProjectCharter')
                  : t('pages.businessCase.actions.startProjectCharter')}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </PageContent>
  )
}
