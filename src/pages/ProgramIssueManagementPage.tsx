import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import {
  EscalatedEntriesTable,
  useEscalatedEntries,
  useEscalatedEntryDetailStore,
  useEscalateEntryDialogStore,
} from '@/features/escalated-entries'
import { useProgram } from '@/features/programs'
import { IssueManagement } from '@/features/risk-register'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Issue management page scoped to a program.
 * @returns The rendered page.
 */
export function ProgramIssueManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data } = useProgram(id)
  const openEscalateDialog = useEscalateEntryDialogStore((s) => s.open)
  const openDetail = useEscalatedEntryDetailStore((s) => s.open)
  const { data: escalatedIssues = [] } = useEscalatedEntries({
    scopeId: id,
    scopeType: 'Program',
    sourceEntryType: 'ISSUE',
  })

  return (
    <PageContent>
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/programs"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.programs.detail.backToList')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/programs/${id}`}
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
      <div className="mb-4">
        <EscalatedEntriesTable
          rows={escalatedIssues}
          onRowClick={(id) => openDetail(id, true)}
          onEscalate={(entry) =>
            openEscalateDialog(entry.sourceEntryId, entry.sourceEntryType, entry.version)
          }
        />
      </div>
      <IssueManagement
        scopeType="Program"
        scopeId={id}
        onEscalate={(entry) => openEscalateDialog(entry.id, 'ISSUE', entry.version)}
      />
    </PageContent>
  )
}
