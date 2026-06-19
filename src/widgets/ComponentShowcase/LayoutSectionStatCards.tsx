import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

const STAT_CARDS = [
  {
    key: 'openTasks',
    val: '48',
    delta: '↓ −6 %',
    numClass: 'text-primary',
    deltaClass: 'text-destructive',
  },
  {
    key: 'completed',
    val: '127',
    delta: '↑ +8 %',
    numClass: 'text-success',
    deltaClass: 'text-success',
  },
  {
    key: 'overdue',
    val: '5',
    delta: '↑ +2 %',
    numClass: 'text-destructive',
    deltaClass: 'text-success',
  },
] as const

/**
 * Stat card row for the LayoutSection showcase.
 * @returns A ShowcaseSection with three KPI stat cards.
 */
export function LayoutSectionStatCards() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.card.statTitle')}>
      {STAT_CARDS.map(({ key, val, delta, numClass, deltaClass }) => (
        <Card
          key={key}
          className="w-40"
        >
          <CardContent>
            <p className="text-muted-foreground mb-2 text-[12px] font-bold tracking-[.04em] uppercase">
              {t(`showcase.card.${key}`)}
            </p>
            <div className="flex items-baseline gap-2.5">
              <span
                className={`text-[30px] leading-none font-extrabold tracking-tight ${numClass}`}
              >
                {val}
              </span>
              <span className={`text-[13px] font-bold ${deltaClass}`}>{delta}</span>
            </div>
            <p className="text-muted-foreground mt-1.5 text-[12px]">
              {t('showcase.card.vsLastWeek')}
            </p>
          </CardContent>
        </Card>
      ))}
    </ShowcaseSection>
  )
}
