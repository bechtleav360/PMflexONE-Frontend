import { useTranslation } from 'react-i18next'

import { ProgramStatusBadge } from '@/features/programs'
import { RiskLevelBadge } from '@/features/risk-register'
import { Avatar, AvatarFallback, PersonBadge, Skeleton } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for data-display components: Avatar and Skeleton.
 * @returns Sections containing Avatar and Skeleton component examples.
 */
// eslint-disable-next-line max-lines-per-function -- showcase component; each badge/avatar variant requires its own JSX block
export function DataDisplaySection() {
  const { t } = useTranslation()

  return (
    <>
      <ShowcaseSection title={t('showcase.avatar.title')}>
        <Avatar>
          {/* eslint-disable-next-line react/jsx-no-literals -- avatar initials */}
          <AvatarFallback className="bg-primary text-primary-foreground">SC</AvatarFallback>
        </Avatar>
        <Avatar>
          {/* eslint-disable-next-line react/jsx-no-literals -- avatar initials */}
          <AvatarFallback className="bg-success text-success-foreground">FF</AvatarFallback>
        </Avatar>
        <Avatar className="h-8 w-8">
          {/* eslint-disable-next-line react/jsx-no-literals -- avatar initials */}
          <AvatarFallback className="bg-warning text-warning-foreground text-xs">JD</AvatarFallback>
        </Avatar>
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.programStatus.title')}>
        <ProgramStatusBadge status="created" />
        <ProgramStatusBadge status="active" />
        <ProgramStatusBadge status="completed" />
        <ProgramStatusBadge status="archived" />
        <ProgramStatusBadge status={null} />
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.riskLevelBadge.title')}>
        <RiskLevelBadge
          riskLevel={null}
          type="RISK"
        />
        <RiskLevelBadge
          riskLevel={1}
          type="RISK"
        />
        <RiskLevelBadge
          riskLevel={12}
          type="RISK"
        />
        <RiskLevelBadge
          riskLevel={20}
          type="RISK"
        />
        <RiskLevelBadge
          riskLevel={null}
          type="OPPORTUNITY"
        />
        <RiskLevelBadge
          riskLevel={1}
          type="OPPORTUNITY"
        />
        <RiskLevelBadge
          riskLevel={12}
          type="OPPORTUNITY"
        />
        <RiskLevelBadge
          riskLevel={20}
          type="OPPORTUNITY"
        />
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.personBadge.title')}>
        <PersonBadge
          firstName="Sarah"
          lastName="Connor"
        />
        <PersonBadge
          firstName="John"
          lastName="Doe"
        />
        <PersonBadge
          firstName="Lena"
          lastName="Müller"
        />
        <PersonBadge
          firstName="Anna"
          lastName="Schmidt"
        />
        <PersonBadge
          firstName="Felix"
          lastName="Weber"
        />
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.skeleton.title')}>
        <div className="gap-sm flex w-64 flex-col">
          <div className="gap-md flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="gap-sm flex flex-1 flex-col">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </ShowcaseSection>
    </>
  )
}
