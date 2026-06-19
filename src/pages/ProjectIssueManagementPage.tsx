import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { useGetProject } from '@/entities/project'
import { useEscalateEntryDialogStore } from '@/features/escalated-entries'
import { IssueManagement } from '@/features/risk-register'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Issue management page scoped to a project.
 * @returns {JSX.Element} The rendered page.
 */
export function ProjectIssueManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data } = useGetProject(id)
  const openEscalateDialog = useEscalateEntryDialogStore((s) => s.open)

  return (
    <PageContent variant="full-height">
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
          {data?.name ?? id}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{t('pages.issueManagement.title')}</span>
      </div>
      <IssueManagement
        scopeType="Project"
        scopeId={id}
        onEscalate={(entry) => openEscalateDialog(entry.id, 'ISSUE', entry.version)}
      />
    </PageContent>
  )
}
