import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { useUserRoles } from '@/entities/project-member'
import {
  AssignMemberDialog,
  EditMemberDialog,
  MemberListView,
  UnassignMemberDialog,
  useProjectMembersStore,
} from '@/features/project-members'
import { Button, Skeleton } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Page for managing members of a specific project.
 * Lists existing role assignments and allows assigning, editing, and removing members.
 * Route param: `:id` (project ID).
 *
 * @returns The rendered project members page.
 */
export function ProjectMembersPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: project } = useGetProject(id)
  const { data: assignments = [], isPending, isError, refetch } = useUserRoles(id)
  const { isAssignOpen, openAssign } = useProjectMembersStore()

  if (isPending) {
    return (
      <PageContent className="max-w-4xl">
        <Skeleton className="mb-6 h-4 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageContent>
    )
  }

  if (isError) {
    return (
      <PageContent className="max-w-4xl">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-muted-foreground">{t('pages.projectMembers.error')}</p>
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
    <PageContent className="max-w-4xl">
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
        <span className="text-sm font-medium">{t('pages.projectMembers.title')}</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pages.projectMembers.title')}</h1>
        <Button onClick={openAssign}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('pages.projectMembers.addButton')}
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">{t('pages.projectMembers.empty')}</p>
      ) : (
        <MemberListView assignments={assignments} />
      )}

      <AssignMemberDialog
        open={isAssignOpen}
        projectId={id}
      />
      <EditMemberDialog projectId={id} />
      <UnassignMemberDialog projectId={id} />
    </PageContent>
  )
}
