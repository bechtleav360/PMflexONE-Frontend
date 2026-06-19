import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Label, YearPicker } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section demonstrating the YearPicker in unset and pre-selected states.
 *
 * @returns YearPicker examples with associated labels.
 */
export function YearPickerSection() {
  const { t } = useTranslation()
  const [yearA, setYearA] = useState<number | null>(null)
  const [yearB, setYearB] = useState<number | null>(2025)

  return (
    <ShowcaseSection title={t('showcase.yearPicker.title')}>
      <div className="flex w-40 flex-col gap-1">
        <Label htmlFor="showcase-year-unset">{t('showcase.yearPicker.unsetLabel')}</Label>
        <YearPicker
          id="showcase-year-unset"
          value={yearA}
          onChange={setYearA}
        />
      </div>
      <div className="flex w-40 flex-col gap-1">
        <Label htmlFor="showcase-year-preset">{t('showcase.yearPicker.presetLabel')}</Label>
        <YearPicker
          id="showcase-year-preset"
          value={yearB}
          onChange={setYearB}
        />
      </div>
    </ShowcaseSection>
  )
}
