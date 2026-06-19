import { useTranslation } from 'react-i18next'

import { LabelBadge } from '@/shared/components/LabelBadge'

import { ShowcaseSection } from './ShowcaseSection'

// ARGB hex values from API — not design tokens; label colours are user-defined runtime data
const SHOWCASE_COLOR_BUG = '#FFE53935' as const
const SHOWCASE_COLOR_FEATURE = '#FF1565C0' as const
const SHOWCASE_COLOR_IMPROVEMENT = '#FF2E7D32' as const

/**
 * Showcase section for the LabelBadge component.
 * Displays badges with different ARGB colour values.
 * @returns A section with representative LabelBadge examples.
 */
export function LabelBadgeSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.labelBadge.title')}>
      {/* Bug — red */}
      <LabelBadge
        name={t('showcase.labelBadge.bug')}
        color={SHOWCASE_COLOR_BUG}
      />
      {/* Feature — blue */}
      <LabelBadge
        name={t('showcase.labelBadge.feature')}
        color={SHOWCASE_COLOR_FEATURE}
      />
      {/* Improvement — green */}
      <LabelBadge
        name={t('showcase.labelBadge.improvement')}
        color={SHOWCASE_COLOR_IMPROVEMENT}
      />
      {/* No colour assigned — falls back to opaque black */}
      <LabelBadge name={t('showcase.labelBadge.noColour')} />
    </ShowcaseSection>
  )
}
