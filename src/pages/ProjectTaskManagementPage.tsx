import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'
import { TaskManagement } from '@/widgets/TaskManagement'

/**
 * Task management page scoped to a single project, identified by `:id` route param.
 * @returns The task management page element.
 */
export function ProjectTaskManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data } = useGetProject(id)
  const [activeBoardName, setActiveBoardName] = useState<string | null>(null)

  return (
    <PageContent
      variant="full-height"
      className="max-w-none"
    >
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.projects', 'Projects')}
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
          {data?.name ?? id}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">
          {activeBoardName
            ? t('pages.taskManagement.titleWithBoard', 'Task Management — {{board}}', {
                board: activeBoardName,
              })
            : t('pages.taskManagement.title', 'Task Management')}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <TaskManagement
          scopeType="Project"
          scopeId={id}
          onActiveBoardNameChange={setActiveBoardName}
        />
      </div>
    </PageContent>
  )
}
