import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { GoalManagement } from '@/features/planning-objects'
import { useProgram } from '@/features/programs'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

/**
 * Goals page scoped to a single program, identified by `:id` route param.
 * @returns The program goals page element.
 */
export function ProgramGoalsPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data: program } = useProgram(id)

  return (
    <PageContent>
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          to="/programs"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('nav.programs')}
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
          {program?.name ?? id}
        </Link>
        <span
          className="text-muted-foreground"
          aria-hidden="true"
        >
          {CRUMB_SEP}
        </span>
        <span className="text-sm font-medium">{t('pages.programGoals.title')}</span>
      </div>
      <h1 className="mb-4 text-2xl font-semibold">{t('pages.programGoals.title')}</h1>
      <GoalManagement
        scopeType="Program"
        scopeId={id}
        portfolioId={program?.portfolio?.item?.id}
        showAppliesTo={!!program?.portfolio?.item?.id}
      />
    </PageContent>
  )
}
