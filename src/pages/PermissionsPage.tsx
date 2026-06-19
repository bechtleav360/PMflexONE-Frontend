import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder permissions page.
 * @returns A minimal permissions page layout.
 */
export function PermissionsPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.permissions.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.permissions.description')}</p>
    </PageContent>
  )
}
