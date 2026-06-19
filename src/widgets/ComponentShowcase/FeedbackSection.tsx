import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import { FeedbackSectionAlerts } from './FeedbackSectionAlerts'
import { FeedbackSectionDialogs } from './FeedbackSectionDialogs'
import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for feedback components: Alert, Tooltip, and Dialog.
 * @returns Sections displaying Alert, Tooltip, and Dialog examples.
 */
export function FeedbackSection() {
  const { t } = useTranslation()

  return (
    <>
      <FeedbackSectionAlerts />

      <ShowcaseSection title={t('showcase.tooltip.title')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={t('showcase.tooltip.notificationsAriaLabel')}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('showcase.tooltip.notifications')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">{t('showcase.tooltip.hoverMe')}</Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('showcase.tooltip.rightTooltip')}</TooltipContent>
        </Tooltip>
      </ShowcaseSection>

      <FeedbackSectionDialogs />
    </>
  )
}
