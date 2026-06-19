import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder users page.
 * @returns A minimal users page layout.
 */
export function UsersPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.users.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.users.description')}</p>
    </PageContent>
  )
}
