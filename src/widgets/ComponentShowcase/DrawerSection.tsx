import { useTranslation } from 'react-i18next'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the Drawer component.
 * @returns A section demonstrating the drawer trigger and content.
 */
export function DrawerSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.drawer.title')}>
      <div className="space-y-sm max-w-sm">
        <p className="text-muted-foreground text-sm">{t('showcase.drawer.description')}</p>
        <p className="text-muted-foreground text-sm">{t('showcase.drawer.hint')}</p>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">{t('showcase.drawer.openDrawer')}</Button>
        </DrawerTrigger>
        <DrawerContent side="right">
          <DrawerHeader>
            <DrawerTitle>{t('showcase.drawer.demoTitle')}</DrawerTitle>
            <DrawerDescription>{t('showcase.drawer.demoDescription')}</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-muted-foreground text-sm">{t('showcase.drawer.hint')}</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">{t('common.close')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ShowcaseSection>
  )
}
