import { Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, BadgeDot, Button, ButtonIcon } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for Button and Badge variants.
 * @returns Sections containing all button and badge variants and sizes.
 */
export function ButtonsSection() {
  const { t } = useTranslation()

  return (
    <>
      <ShowcaseSection title={t('showcase.button.title')}>
        <Button variant="default">{t('showcase.button.default')}</Button>
        <Button variant="secondary">{t('showcase.button.secondary')}</Button>
        <Button variant="outline">{t('showcase.button.outline')}</Button>
        <Button variant="ghost">{t('showcase.button.ghost')}</Button>
        <Button variant="link">{t('showcase.button.link')}</Button>
        <Button variant="destructive">{t('showcase.button.destructive')}</Button>
        <Button size="sm">{t('showcase.button.small')}</Button>
        <Button size="lg">{t('showcase.button.large')}</Button>
        <Button disabled>{t('showcase.button.disabled')}</Button>
        <Button>
          <ButtonIcon icon={Plus} />
          {t('showcase.button.withIcon')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
        >
          <ButtonIcon icon={Plus} />
          {t('showcase.button.withIconGhost')}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('showcase.button.settingsAriaLabel')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.badge.title')}>
        <Badge>{t('showcase.badge.default')}</Badge>
        <Badge variant="success">{t('showcase.badge.success')}</Badge>
        <Badge variant="warning">{t('showcase.badge.warning')}</Badge>
        <Badge variant="danger">{t('showcase.badge.danger')}</Badge>
        <Badge variant="neutral">{t('showcase.badge.neutral')}</Badge>
        <Badge variant="outline">{t('showcase.badge.outline')}</Badge>
        <Badge variant="destructive">{t('showcase.badge.destructive')}</Badge>
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.badge.dotTitle')}>
        <Badge>
          <BadgeDot />
          {t('showcase.badge.dotActive')}
        </Badge>
        <Badge variant="success">
          <BadgeDot />
          {t('showcase.badge.dotSuccess')}
        </Badge>
        <Badge variant="warning">
          <BadgeDot />
          {t('showcase.badge.dotWarning')}
        </Badge>
        <Badge variant="danger">
          <BadgeDot />
          {t('showcase.badge.dotDanger')}
        </Badge>
      </ShowcaseSection>
    </>
  )
}
