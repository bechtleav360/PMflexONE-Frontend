import { useState } from 'react'

import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetBusinessCaseByProjectId } from '@/entities/business-case'
import { useGetProject } from '@/entities/project'
import { useGetProjectCharterByProjectId } from '@/entities/project-charter'
import { useGetProjectInitiationRequestByProjectId } from '@/entities/project-initiation-request'
import { BusinessCaseDialog } from '@/features/business-case'
import { ProjectCharterDialog } from '@/features/project-charter'
import { ProjectInitiationRequestDialog } from '@/features/project-initiation-requests'
import { Button, Separator, Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

import { ProjectDetailActions } from './ProjectDetailActions'
import { ProjectDetailFields } from './ProjectDetailFields'

function renderProjectNavLinksFirst(id: string, t: TFunction) {
  return (
    <>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/risk-management`}>{t('pages.riskManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/issue-management`}>{t('pages.issueManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/problem-management`}>{t('pages.problemManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/tasks`}>{t('pages.taskManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/projectmember`}>{t('pages.projectMembers.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/rasci`}>{t('pages.rasciMatrix.rightsButton')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/goals`}>{t('pages.projectGoals.title')}</Link>
      </Button>
    </>
  )
}

function renderProjectNavLinksSecond(id: string, t: TFunction) {
  return (
    <>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/requirements`}>{t('pages.projectRequirements.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/assumptions`}>{t('pages.projectAssumptions.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/constraints`}>{t('pages.projectConstraints.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/deliverables`}>
          {t('features.deliverablesManagement.pageTitle')}
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/support-services`}>
          {t('features.supportServicesManagement.pageTitle')}
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/planning-roles`}>
          {t('features.planningRolesManagement.pageTitle')}
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/projects/${id}/stakeholder-management`}>
          {t('pages.stakeholderManagement.title')}
        </Link>
      </Button>
    </>
  )
}

function renderProjectBreadcrumb(backLabel: string, projectName: string) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        to="/projects"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        {backLabel}
      </Link>
      <span
        className="text-muted-foreground"
        aria-hidden="true"
      >
        {CRUMB_SEP}
      </span>
      <span className="text-sm font-medium">{projectName}</span>
    </div>
  )
}

/**
 * Project detail page — fetches and displays a single project by ID.
 *
 * @returns The project detail page element.
 */
export function ProjectDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isPending, isError, refetch } = useGetProject(id)
  const { data: charterSummary } = useGetProjectCharterByProjectId(id)
  const { data: pirSummary } = useGetProjectInitiationRequestByProjectId(id)
  const { data: bcSummary } = useGetBusinessCaseByProjectId(id)

  const [isPIRDialogOpen, setIsPIRDialogOpen] = useState(false)
  const [isBCDialogOpen, setIsBCDialogOpen] = useState(false)
  const [isCharterDialogOpen, setIsCharterDialogOpen] = useState(false)

  if (isPending) {
    return (
      <PageContent className="max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </PageContent>
    )
  }

  if (isError) {
    return (
      <PageContent className="max-w-3xl">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">{t('pages.projectDetail.error.title')}</p>
          <Button
            variant="outline"
            onClick={() => void refetch()}
          >
            {t('pages.projectDetail.error.retry')}
          </Button>
        </div>
      </PageContent>
    )
  }

  return (
    <PageContent className="max-w-3xl">
      {renderProjectBreadcrumb(t('pages.projectDetail.backToList'), data.name)}

      <h1 className="mb-6 text-2xl font-semibold">{data.name}</h1>

      <ProjectDetailFields data={data} />

      <Separator className="my-6" />

      <div className="flex flex-wrap items-center gap-4">
        {renderProjectNavLinksFirst(id, t)}
        {renderProjectNavLinksSecond(id, t)}
      </div>

      <ProjectDetailActions
        pirSummary={pirSummary}
        bcSummary={bcSummary}
        charterSummary={charterSummary}
        onOpenPIR={() => setIsPIRDialogOpen(true)}
        onOpenBC={() => setIsBCDialogOpen(true)}
        onOpenCharter={() => setIsCharterDialogOpen(true)}
      />

      <ProjectInitiationRequestDialog
        projectId={id}
        isOpen={isPIRDialogOpen}
        onClose={() => setIsPIRDialogOpen(false)}
      />

      <BusinessCaseDialog
        projectId={id}
        isOpen={isBCDialogOpen}
        onClose={() => setIsBCDialogOpen(false)}
      />

      <ProjectCharterDialog
        projectId={id}
        isOpen={isCharterDialogOpen}
        onClose={() => setIsCharterDialogOpen(false)}
      />
    </PageContent>
  )
}
