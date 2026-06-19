import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Alert showcase for FeedbackSection.
 * @returns A ShowcaseSection with all four Alert variant examples.
 */
export function FeedbackSectionAlerts() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.alert.title')}>
      <Alert
        variant="info"
        className="w-80"
      >
        <Info className="h-4 w-4" />
        <AlertTitle>{t('showcase.alert.headsUpTitle')}</AlertTitle>
        <AlertDescription>{t('showcase.alert.headsUpDescription')}</AlertDescription>
      </Alert>
      <Alert
        variant="success"
        className="w-80"
      >
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>{t('showcase.alert.successTitle')}</AlertTitle>
        <AlertDescription>{t('showcase.alert.successDescription')}</AlertDescription>
      </Alert>
      <Alert
        variant="warning"
        className="w-80"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('showcase.alert.warningTitle')}</AlertTitle>
        <AlertDescription>{t('showcase.alert.warningDescription')}</AlertDescription>
      </Alert>
      <Alert
        variant="destructive"
        className="w-80"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('showcase.alert.degradedTitle')}</AlertTitle>
        <AlertDescription>{t('showcase.alert.degradedDescription')}</AlertDescription>
      </Alert>
    </ShowcaseSection>
  )
}
