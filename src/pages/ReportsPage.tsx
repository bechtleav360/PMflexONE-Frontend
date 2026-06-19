import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder reports page.
 * @returns A minimal reports page layout.
 */
export function ReportsPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.reports.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.reports.description')}</p>
    </PageContent>
  )
}
