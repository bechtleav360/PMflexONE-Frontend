import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/shared/components'

import { LayoutSectionStatCards } from './LayoutSectionStatCards'
import { LayoutSectionTabs } from './LayoutSectionTabs'
import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for layout and container components: Card, stat Cards, and Tabs.
 * @returns Sections containing Card and Tabs component examples.
 */
export function LayoutSection() {
  const { t } = useTranslation()

  return (
    <>
      <ShowcaseSection title={t('showcase.card.standardTitle')}>
        <Card className="w-80">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>{t('showcase.card.projectTitle')}</CardTitle>
              <CardDescription>{t('showcase.card.projectDescription')}</CardDescription>
            </div>
            <CardIcon className="bg-primary-soft text-primary">
              <FileText className="size-[18px]" />
            </CardIcon>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">{t('showcase.card.status')}</span>
              <Badge variant="default">
                <span
                  className="bg-primary size-1.5 rounded-full"
                  aria-hidden="true"
                />
                {t('showcase.card.inProgress')}
              </Badge>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">{t('showcase.card.dueDate')}</span>
              {/* eslint-disable-next-line react/jsx-no-literals -- demo date */}
              <span className="font-semibold">31.05.2026</span>
            </div>
            <div className="flex flex-col gap-1 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('showcase.card.progress')}</span>
                {/* eslint-disable-next-line react/jsx-no-literals -- demo percent */}
                <span className="font-semibold">62 %</span>
              </div>
              <div
                className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={62}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('showcase.card.progress')}
              >
                <div className="bg-primary h-full w-[62%] rounded-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              size="sm"
              variant="ghost"
            >
              {t('showcase.card.cancel')}
            </Button>
            <Button size="sm">{t('showcase.card.save')}</Button>
          </CardFooter>
        </Card>
      </ShowcaseSection>

      <LayoutSectionStatCards />

      <LayoutSectionTabs />
    </>
  )
}
