import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { GoalManagement } from '@/features/planning-objects'
import { usePrograms } from '@/features/programs'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Goals page scoped to a single project, identified by `:id` route param.
 * @returns The project goals page element.
 */
export function ProjectGoalsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(id)
  const { data: programs = [] } = usePrograms()
  const parentProgram = programs.find((p) => p.projects?.some((edge) => edge.item.id === id))
  const programId = parentProgram?.id ?? null
  const portfolioId = parentProgram?.portfolio?.item.id ?? null

  return (
    <PageContent>
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.projects')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/projects/${id}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {project?.name ?? id}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{t('pages.projectGoals.title')}</span>
      </div>
      <h1 className="mb-4 text-2xl font-semibold">{t('pages.projectGoals.title')}</h1>
      <GoalManagement
        scopeType="Project"
        scopeId={id}
        programId={programId}
        portfolioId={portfolioId}
        showAppliesTo
      />
    </PageContent>
  )
}
