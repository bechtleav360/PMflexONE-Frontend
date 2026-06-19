import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { BusinessCaseForm, useCreateBusinessCase } from '@/features/business-case'
import type { BusinessCaseFormValues } from '@/features/business-case'
import { showPromise } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'
import { PageContent } from '@/widgets/Layout'

/**
 * Page for creating a new Business Case linked to a project.
 * Reads `?projectId` from the query string; redirects to `/initiation-requests` if missing.
 *
 * Route: `/business-cases/new?projectId=<id>`
 *
 * @returns The new business case page or a redirect.
 */
export function BusinessCaseNewPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId') ?? ''

  const { mutateAsync: createBC, isPending } = useCreateBusinessCase()

  if (!projectId) {
    return (
      <Navigate
        to="/initiation-requests"
        replace
      />
    )
  }

  function handleSaveDraft(values: BusinessCaseFormValues) {
    showPromise(
      createBC({
        projectId,
        clientSummary: values.clientSummary || undefined,
        projectRationale: values.projectRationale || undefined,
        expectedBenefit: values.expectedBenefit || undefined,
        options: values.options || undefined,
        investmentCalculation: values.investmentCalculation || undefined,
        keyRisks: values.keyRisks || undefined,
        expectedNegativeSideEffect: values.expectedNegativeSideEffect || undefined,
        timeline: values.timeline || undefined,
      }).then((bc) => {
        void navigate(`/business-cases/${bc.id}`)
        return bc
      }),
      {
        loading: t('pages.businessCase.toast.creating'),
        success: t('pages.businessCase.toast.createSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.businessCase.toast.createError')),
      },
    )
  }

  return (
    <PageContent>
      <h1 className="mb-6 text-2xl font-semibold">{t('pages.businessCase.newPage.heading')}</h1>
      <div className="max-w-2xl">
        <BusinessCaseForm
          mode="create"
          onSaveDraft={handleSaveDraft}
          onMarkComplete={undefined}
          isSavePending={isPending}
        />
      </div>
    </PageContent>
  )
}
