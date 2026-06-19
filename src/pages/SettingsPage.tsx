import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder settings page.
 * @returns A minimal settings page layout.
 */
export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.settings.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.settings.description')}</p>
    </PageContent>
  )
}
