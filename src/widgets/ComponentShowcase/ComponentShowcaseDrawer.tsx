import { lazy, Suspense } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components'
import { useComponentShowcaseDrawerStore } from '@/shared/lib/useComponentShowcaseDrawerStore'

const ComponentShowcase = lazy(async () => ({
  default: (await import('./ComponentShowcase')).ComponentShowcase,
}))

/**
 * Development-only drawer that hosts the shadcn/ui component showcase.
 * @returns A right-aligned drawer with the showcase content.
 */
export function ComponentShowcaseDrawer() {
  const { t } = useTranslation()
  const isOpen = useComponentShowcaseDrawerStore((state) => state.isOpen)
  const setOpen = useComponentShowcaseDrawerStore((state) => state.setOpen)

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setOpen}
    >
      <DrawerContent side="right">
        <DrawerHeader>
          <DrawerTitle>{t('showcase.componentShowcase.title')}</DrawerTitle>
          <DrawerDescription>{t('showcase.componentShowcase.description')}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Suspense
            fallback={
              <div
                aria-busy="true"
                className="border-border/60 bg-muted/20 min-h-[24rem] rounded-lg border border-dashed"
              />
            }
          >
            <ComponentShowcase />
          </Suspense>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
