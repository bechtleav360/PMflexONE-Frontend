import { useTranslation } from 'react-i18next'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Tabs showcase for the LayoutSection.
 * @returns A ShowcaseSection with a Tabs component example.
 */
export function LayoutSectionTabs() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.tabs.title')}>
      <Tabs
        defaultValue="all"
        className="w-[440px]"
      >
        <TabsList>
          <TabsTrigger value="all">
            {t('showcase.tabs.all')}
            <span
              className="bg-border text-muted-foreground group-data-[state=active]:bg-primary-soft group-data-[state=active]:text-primary inline-flex h-4 min-w-[18px] items-center justify-center rounded-sm px-1 text-[10px] font-bold"
              aria-hidden="true"
            >
              {24}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active">
            {t('showcase.tabs.active')}
            <span
              className="bg-border text-muted-foreground group-data-[state=active]:bg-primary-soft group-data-[state=active]:text-primary inline-flex h-4 min-w-[18px] items-center justify-center rounded-sm px-1 text-[10px] font-bold"
              aria-hidden="true"
            >
              {12}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived">{t('showcase.tabs.archived')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <p className="text-muted-foreground text-sm">{t('showcase.tabs.allContent')}</p>
        </TabsContent>
        <TabsContent value="active">
          <p className="text-muted-foreground text-sm">{t('showcase.tabs.activeContent')}</p>
        </TabsContent>
        <TabsContent value="archived">
          <p className="text-muted-foreground text-sm">{t('showcase.tabs.archivedContent')}</p>
        </TabsContent>
      </Tabs>
    </ShowcaseSection>
  )
}
