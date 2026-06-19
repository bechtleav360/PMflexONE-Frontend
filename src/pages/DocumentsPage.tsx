import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder documents page.
 * @returns A minimal documents page layout.
 */
export function DocumentsPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.documents.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.documents.description')}</p>
    </PageContent>
  )
}
