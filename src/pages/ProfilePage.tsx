import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder profile page.
 * @returns A minimal profile page layout.
 */
export function ProfilePage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.profile.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.profile.description')}</p>
    </PageContent>
  )
}
