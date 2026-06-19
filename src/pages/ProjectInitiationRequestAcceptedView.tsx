import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useGetBusinessCaseByProjectId } from '@/entities/business-case'
import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'
import { ProjectInitiationRequestForm } from '@/features/project-initiation-requests'
import type { ProjectInitiationRequestFormValues } from '@/features/project-initiation-requests'
import { Badge, Button, ButtonIcon } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

const NOOP = () => {}

function toDefaultValues(
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

interface ProjectInitiationRequestAcceptedViewProps {
  pir: ProjectInitiationRequest
}

/**
 * Read-only page view for an accepted project initiation request.
 * Shown when `pir.status === 'accepted'`.
 *
 * Displays the PIR fields in view mode and exposes an entry point to either
 * create or navigate to the linked Business Case.
 *
 * @param props - Component props.
 * @param props.pir - The accepted PIR to display.
 * @returns The accepted initiation request page element.
 */
export function ProjectInitiationRequestAcceptedView({
  pir,
}: ProjectInitiationRequestAcceptedViewProps) {
  const { t } = useTranslation()
  const projectId = pir.requestingProject?.item.id ?? ''
  const { data: existingBc, isPending: isBcPending } = useGetBusinessCaseByProjectId(projectId)
  const defaultValues = toDefaultValues(pir)

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

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{pir.name}</h1>
        <Badge className="bg-success/10 text-success">
          {t('pages.initiationRequests.detail.readOnlyBadge')}
        </Badge>
      </div>

      <div className="mt-4">
        {isBcPending ? (
          <Button
            disabled
            aria-disabled={true}
          >
            {t('pages.initiationRequests.detail.startBusinessCaseButton')}
          </Button>
        ) : existingBc ? (
          <Button asChild>
            <Link to={`/business-cases/${existingBc.id}`}>
              {t('pages.initiationRequests.detail.viewEditBusinessCaseButton')}
            </Link>
          </Button>
        ) : projectId ? (
          <Button asChild>
            <Link to={`/business-cases/new?projectId=${projectId}`}>
              <ButtonIcon icon={Plus} />
              {t('pages.initiationRequests.detail.startBusinessCaseButton')}
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            aria-disabled={true}
          >
            {t('pages.initiationRequests.detail.startBusinessCaseButton')}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <ProjectInitiationRequestForm
          mode="view"
          defaultValues={defaultValues}
          onSubmit={NOOP}
          isPending={false}
        />
      </div>
    </PageContent>
  )
}
