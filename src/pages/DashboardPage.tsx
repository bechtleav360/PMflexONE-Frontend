import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder dashboard page.
 * @returns A minimal dashboard page layout.
 */
export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.dashboard.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.dashboard.description')}</p>
    </PageContent>
  )
}
