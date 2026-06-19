import { useTranslation } from 'react-i18next'

import { PageContent } from '@/widgets/Layout'

/**
 * Catch-all 404 page rendered for any unrecognised route.
 * @returns A minimal page with a 404 heading.
 */
export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <PageContent>
      <h1>{t('pages.notFound.title')}</h1>
    </PageContent>
  )
}
