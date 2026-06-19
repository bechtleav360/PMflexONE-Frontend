import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Label, RadioGroup as RadioGroupControl, RadioGroupItem } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

type DeliveryMode = 'comfortable' | 'compact'

/**
 * Showcase section for radio group controls.
 * @returns A section demonstrating controlled radio group states.
 */
export function FormSectionRadioGroup() {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('comfortable')
  const { t } = useTranslation()
  const titleId = 'showcase-radio-group-title'

  const handleValueChange = (value: string) => {
    if (value === 'comfortable' || value === 'compact') {
      setDeliveryMode(value)
    }
  }

  return (
    <ShowcaseSection
      title={t('showcase.radioGroup.title')}
      titleId={titleId}
    >
      <RadioGroupControl
        value={deliveryMode}
        onValueChange={handleValueChange}
        aria-labelledby={titleId}
        className="gap-lg"
      >
        <div className="gap-sm flex items-center">
          <RadioGroupItem
            id="showcase-radio-comfortable"
            value="comfortable"
          />
          <Label htmlFor="showcase-radio-comfortable">{t('showcase.radioGroup.comfortable')}</Label>
        </div>
        <div className="gap-sm flex items-center">
          <RadioGroupItem
            id="showcase-radio-compact"
            value="compact"
          />
          <Label htmlFor="showcase-radio-compact">{t('showcase.radioGroup.compact')}</Label>
        </div>
      </RadioGroupControl>
    </ShowcaseSection>
  )
}
