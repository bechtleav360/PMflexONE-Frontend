import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { useGetProjectCharter } from '@/entities/project-charter'
import {
  charterToFormValues,
  ProjectCharterForm,
  ProjectCharterStatusBadge,
  useProjectCharterDetailActions,
} from '@/features/project-charter'
import { Alert, AlertDescription, AlertTitle, Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

function charterProjectId(pc: { project?: { id: string } | null } | undefined): string {
  return pc?.project?.id ?? ''
}

/**
 * Detail page for a single Project Charter.
 *
 * Entry points: Project Detail page ("View / Edit Project Charter" button)
 *               and Business Case Detail page (secondary entry).
 *
 * - status `DRAFT`     → form with Save + Submit actions.
 * - status `ACCEPTED`  → form with Save only; Submit button is unmounted.
 *
 * Route: `/project-charters/:id`
 *
 * @returns The project charter detail page.
 */
export function ProjectCharterDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()

  const { data: pc, isPending, isError } = useGetProjectCharter(id)
  const projectId = charterProjectId(pc)
  const { data: project } = useGetProject(projectId)
  const { handleSave, handleSubmit, isUpdating, isSubmitting } = useProjectCharterDetailActions(pc)

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

  if (isError || !pc) {
    return (
      <PageContent>
        <Alert variant="destructive">
          <AlertTitle>{t('pages.projectCharter.loadErrorTitle')}</AlertTitle>
          <AlertDescription>{t('pages.projectCharter.loadError')}</AlertDescription>
        </Alert>
      </PageContent>
    )
  }

  const isAccepted = pc.status === 'ACCEPTED'

  return (
    <PageContent>
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.projectDetail.backToList')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {project?.name ?? projectId}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{t('pages.projectCharter.detailPage.heading')}</span>
      </div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{t('pages.projectCharter.detailPage.heading')}</h1>
        <ProjectCharterStatusBadge status={pc.status} />
      </div>

      <div className="max-w-2xl">
        <ProjectCharterForm
          mode="edit"
          defaultValues={charterToFormValues(pc)}
          onSave={handleSave}
          onSubmit={isAccepted ? undefined : handleSubmit}
          isSavePending={isUpdating}
          isSubmitPending={isSubmitting}
        />
      </div>
    </PageContent>
  )
}
