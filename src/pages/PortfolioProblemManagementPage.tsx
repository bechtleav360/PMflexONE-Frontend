import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import {
  EscalatedEntriesTable,
  useEscalatedEntries,
  useEscalatedEntryDetailStore,
  useEscalateEntryDialogStore,
} from '@/features/escalated-entries'
import { usePortfolios } from '@/features/portfolios'
import { ProblemManagement } from '@/features/risk-register'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Problem management page scoped to a portfolio.
 * @returns {JSX.Element} The rendered page.
 */
export function PortfolioProblemManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: portfolios = [] } = usePortfolios()
  const portfolio = portfolios.find((p) => p.id === id)
  const openEscalateDialog = useEscalateEntryDialogStore((s) => s.open)
  const openDetail = useEscalatedEntryDetailStore((s) => s.open)
  const { data: escalatedProblems = [] } = useEscalatedEntries({
    scopeId: id,
    scopeType: 'Portfolio',
    sourceEntryType: 'PROBLEM',
  })

  return (
    <PageContent variant="full-height">
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/portfolios"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.portfolios.title')}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <Link
          to={`/portfolios/${id}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {portfolio?.name ?? id}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{t('pages.problemManagement.title')}</span>
      </div>
      <div className="mb-4">
        <EscalatedEntriesTable
          rows={escalatedProblems}
          onRowClick={(entryId) => openDetail(entryId, true)}
        />
      </div>
      <ProblemManagement
        scopeType="Portfolio"
        scopeId={id}
        onEscalate={(entry) => openEscalateDialog(entry.id, 'PROBLEM', entry.version)}
      />
    </PageContent>
  )
}
