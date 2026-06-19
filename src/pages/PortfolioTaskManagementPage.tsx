import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { usePortfolios } from '@/features/portfolios'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'
import { TaskManagement } from '@/widgets/TaskManagement'

/**
 * Task management page scoped to a single portfolio, identified by `:id` route param.
 * @returns The task management page element.
 */
export function PortfolioTaskManagementPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: portfolios = [] } = usePortfolios()
  const portfolio = portfolios.find((p) => p.id === id)
  const [activeBoardName, setActiveBoardName] = useState<string | null>(null)

  return (
    <PageContent
      variant="full-height"
      className="max-w-none"
    >
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          to="/portfolios"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.portfolios', 'Portfolios')}
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
          scopeType="Portfolio"
          scopeId={id}
          onActiveBoardNameChange={setActiveBoardName}
        />
      </div>
    </PageContent>
  )
}
