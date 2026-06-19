import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { ConstraintManagement } from '@/features/planning-objects'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Constraints page scoped to a single project, identified by `:id` route param.
 * @returns The project constraints page element.
 */
export function ProjectConstraintsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(id)

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
        <span className="text-sm font-medium">{t('pages.projectConstraints.title')}</span>
      </div>
      <div data-testid="project-constraints-page">
        <h1 className="mb-4 text-2xl font-semibold">{t('pages.projectConstraints.title')}</h1>
        <ConstraintManagement scopeId={id} />
      </div>
    </PageContent>
  )
}
