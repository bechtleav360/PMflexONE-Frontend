import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Placeholder messages page.
 * @returns A minimal messages page layout.
 */
export function MessagesPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1 className="text-3xl font-bold tracking-tight">{t('pages.messages.title')}</h1>
      <p className="text-muted-foreground mt-xs">{t('pages.messages.description')}</p>
    </PageContent>
  )
}
