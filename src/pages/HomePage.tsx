import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Application home page displaying a short introduction to the app shell.
 * @returns The page content rendered inside the global {@link Layout}.
 */
export function HomePage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <div className="mb-3xl space-y-xs">
        <h1 className="text-3xl font-bold tracking-tight">{t('pages.home.title')}</h1>
        <p className="text-muted-foreground">{t('pages.home.description')}</p>
      </div>
    </PageContent>
  )
}
