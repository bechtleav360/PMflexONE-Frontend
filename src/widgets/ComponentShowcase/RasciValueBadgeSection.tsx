import { useTranslation } from 'react-i18next'

import { RasciValueBadge } from '@/shared/components/RasciValueBadge'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the RasciValueBadge component.
 * Displays all six permissionKey variants: R, A, S, C, I, and —.
 * @returns A section with all RasciValueBadge variants.
 */
export function RasciValueBadgeSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.rasciValueBadge.title')}>
      {/* R — Responsible (write access) */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="R" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.writeAccess')}
        </span>
      </div>
      {/* A — Accountable (write access) */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="A" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.writeAccess')}
        </span>
      </div>
      {/* S — Supportive (write access) */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="S" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.writeAccess')}
        </span>
      </div>
      {/* C — Consulted (write access) */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="C" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.writeAccess')}
        </span>
      </div>
      {/* I — Informed (read access) */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="I" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.readAccess')}
        </span>
      </div>
      {/* — — No access */}
      <div className="flex flex-col items-center gap-1">
        <RasciValueBadge value="—" />
        <span className="text-muted-foreground text-xs">
          {t('showcase.rasciValueBadge.noAccess')}
        </span>
      </div>
    </ShowcaseSection>
  )
}
