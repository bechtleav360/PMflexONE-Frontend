import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import {
  formValuesToMutationFields,
  ProjectCharterForm,
  useCreateProjectCharter,
  type ProjectCharterFormValues,
} from '@/features/project-charter'
import { showPromise } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'
import { PageContent } from '@/widgets/Layout'

/**
 * Page for creating a new Project Charter linked to a project.
 * Reads `?projectId` from the query string; redirects to `/projects` if missing.
 *
 * Route: `/project-charters/new?projectId=<id>`
 *
 * @returns The new project charter page.
 */
export function ProjectCharterNewPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId') ?? ''

  const { mutateAsync: createPC, isPending } = useCreateProjectCharter()
  const { data: project } = useGetProject(projectId)

  if (!projectId) {
    return (
      <Navigate
        to="/projects"
        replace
      />
    )
  }

  const handleSave = (values: ProjectCharterFormValues) => {
    showPromise(
      createPC({ projectId, ...formValuesToMutationFields(values) }).then((pc) => {
        void navigate(`/project-charters/${pc.id}`)
        return pc
      }),
      {
        loading: t('pages.projectCharter.toast.creating'),
        success: t('pages.projectCharter.toast.createSuccess'),
        error: (err) => getGraphQLErrorMessage(err, t('pages.projectCharter.toast.createError')),
      },
    )
  }

  return (
    <PageContent>
      <div className="mb-6 flex items-center gap-2">
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
        <span className="text-sm font-medium">{t('pages.projectCharter.newPage.heading')}</span>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">{t('pages.projectCharter.newPage.heading')}</h1>
      <div className="max-w-2xl">
        <ProjectCharterForm
          mode="create"
          onSave={handleSave}
          isSavePending={isPending}
        />
      </div>
    </PageContent>
  )
}
