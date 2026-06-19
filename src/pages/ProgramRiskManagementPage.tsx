import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import {
  EscalatedEntriesTable,
  useEscalatedEntries,
  useEscalatedEntryDetailStore,
  useEscalateEntryDialogStore,
} from '@/features/escalated-entries'
import { useProgram } from '@/features/programs'
import { RiskManagement } from '@/features/risk-register'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Risk management page scoped to a program.
 * @returns The rendered page.
 */
export function ProgramRiskManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data } = useProgram(id)
  const openEscalateDialog = useEscalateEntryDialogStore((s) => s.open)
  const openDetail = useEscalatedEntryDetailStore((s) => s.open)
  const { data: escalatedRisks = [] } = useEscalatedEntries({
    scopeId: id,
    scopeType: 'Program',
    sourceEntryType: 'RISK',
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
        <span className="text-sm font-medium">{t('pages.riskManagement.title')}</span>
      </div>
      <div className="mb-4">
        <EscalatedEntriesTable
          rows={escalatedRisks}
          onRowClick={(entryId) => openDetail(entryId, true)}
          onEscalate={(entry) =>
            openEscalateDialog(entry.sourceEntryId, entry.sourceEntryType, entry.version)
          }
        />
      </div>
      <RiskManagement
        scopeType="Program"
        scopeId={id}
        onEscalate={(entry) => openEscalateDialog(entry.id, entry.type, entry.version)}
      />
    </PageContent>
  )
}
