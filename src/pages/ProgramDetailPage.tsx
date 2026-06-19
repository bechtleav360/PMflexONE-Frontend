import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { ProgramInitiationRequestDialog } from '@/features/program-initiation-requests'
import {
  EditProgramDialog,
  ProgramDetailFields,
  ProgramProjectsList,
  useProgramDetailPage,
} from '@/features/programs'
import { Button, Separator, Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

function renderProgramNavLinks(id: string, t: ReturnType<typeof useTranslation>['t']) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/risk-management`}>{t('pages.riskManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/issue-management`}>{t('pages.issueManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/problem-management`}>{t('pages.problemManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/tasks`}>{t('pages.taskManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/goals`}>{t('pages.programGoals.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/projectmember`}>{t('pages.projectMembers.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/rasci`}>{t('pages.rasciMatrix.rightsButton')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/programs/${id}/stakeholder-management`}>
          {t('pages.stakeholderManagement.title')}
        </Link>
      </Button>
    </div>
  )
}

function renderProgramActions(
  pirSummary: unknown,
  setIsPIRDialogOpen: (open: boolean) => void,
  t: ReturnType<typeof useTranslation>['t'],
) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="outline"
        onClick={() => setIsPIRDialogOpen(true)}
      >
        {pirSummary
          ? t('pages.programs.detail.actions.viewPIR')
          : t('pages.programs.detail.actions.createPIR')}
      </Button>
    </div>
  )
}

function renderProgramBreadcrumb(backLabel: string, programName: string) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        to="/programs"
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
      <span className="text-sm font-medium">{programName}</span>
    </div>
  )
}

/**
 * Page component displaying the details of a single program.
 * @returns The program detail page element.
 */
export function ProgramDetailPage() {
  const { t, i18n } = useTranslation()
  const {
    id,
    data,
    isPending,
    isError,
    refetch,
    openEdit,
    pirSummary,
    portfolioId,
    programName,
    isPIRDialogOpen,
    setIsPIRDialogOpen,
  } = useProgramDetailPage()

  if (isPending) {
    return (
      <PageContent>
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </PageContent>
    )
  }

  if (isError || !data) {
    return (
      <PageContent>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">{t('pages.programs.detail.error.title')}</p>
          <Button
            variant="outline"
            onClick={() => void refetch()}
          >
            {t('pages.programs.detail.error.retry')}
          </Button>
        </div>
      </PageContent>
    )
  }

  return (
    <PageContent className="max-w-3xl">
      {renderProgramBreadcrumb(t('pages.programs.detail.backToList'), data.name)}

      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            openEdit(data)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('pages.programs.detail.edit')}
        </Button>
      </div>

      <ProgramDetailFields
        data={data}
        locale={i18n.language}
      />

      <Separator className="my-6" />

      {renderProgramNavLinks(id, t)}

      <Separator className="my-6" />

      {renderProgramActions(pirSummary, setIsPIRDialogOpen, t)}

      <ProgramProjectsList projects={data.projects} />

      <ProgramInitiationRequestDialog
        programId={id}
        portfolioId={portfolioId}
        programName={programName}
        isOpen={isPIRDialogOpen}
        onClose={() => setIsPIRDialogOpen(false)}
      />

      <EditProgramDialog />
    </PageContent>
  )
}
