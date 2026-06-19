import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { RequirementManagement } from '@/features/planning-objects'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Requirements page scoped to a single project, identified by `:id` route param.
 * @returns The project requirements page element.
 */
export function ProjectRequirementsPage() {
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
        <span className="text-sm font-medium">{t('pages.projectRequirements.title')}</span>
      </div>
      <div data-testid="project-requirements-page">
        <h1 className="mb-4 text-2xl font-semibold">{t('pages.projectRequirements.title')}</h1>
        <RequirementManagement scopeId={id} />
      </div>
    </PageContent>
  )
}
