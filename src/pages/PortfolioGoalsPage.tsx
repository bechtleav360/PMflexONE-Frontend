import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { GoalManagement } from '@/features/planning-objects'
import { usePortfolios } from '@/features/portfolios'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Goals page scoped to a single portfolio, identified by `:id` route param.
 * @returns The portfolio goals page element.
 */
export function PortfolioGoalsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: portfolios = [] } = usePortfolios()
  const portfolio = portfolios.find((p) => p.id === id)

  return (
    <PageContent>
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          to="/portfolios"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.portfolios')}
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
        <span className="text-sm font-medium">{t('pages.portfolioGoals.title')}</span>
      </div>
      <h1 className="mb-4 text-2xl font-semibold">{t('pages.portfolioGoals.title')}</h1>
      <GoalManagement
        scopeType="Portfolio"
        scopeId={id}
        showAppliesTo={false}
      />
    </PageContent>
  )
}
