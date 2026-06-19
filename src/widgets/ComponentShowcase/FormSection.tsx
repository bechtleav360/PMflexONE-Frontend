import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  DatePicker,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/shared/components'

import { FormSectionCheckbox } from './FormSectionCheckbox'
import { FormSectionInputs } from './FormSectionInputs'
import { FormSectionRadioGroup } from './FormSectionRadioGroup'
import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for form components: Input, Label, Select, DatePicker, Checkbox, RadioGroup, Switch.
 * @returns Sections displaying all form control variants and states.
 */
export function FormSection() {
  const [switchOn, setSwitchOn] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <FormSectionInputs />

      <ShowcaseSection title={t('showcase.select.title')}>
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('showcase.select.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30s">{t('showcase.select.every30Seconds')}</SelectItem>
            <SelectItem value="1m">{t('showcase.select.everyMinute')}</SelectItem>
            <SelectItem value="5m">{t('showcase.select.every5Minutes')}</SelectItem>
            <SelectItem value="1h">{t('showcase.select.everyHour')}</SelectItem>
          </SelectContent>
        </Select>
      </ShowcaseSection>

      <ShowcaseSection title={t('showcase.datePicker.title')}>
        <div className="gap-sm flex w-80 flex-col">
          <Label htmlFor="showcase-date-picker-today">
            {t('showcase.datePicker.labelWithToday')}
          </Label>
          <DatePicker
            id="showcase-date-picker-today"
            defaultValue={new Date(2026, 3, 9)}
            showTodayButton
          />
        </div>
        <div className="gap-sm flex w-80 flex-col">
          <Label htmlFor="showcase-date-picker-no-today">
            {t('showcase.datePicker.labelWithoutToday')}
          </Label>
          <DatePicker
            id="showcase-date-picker-no-today"
            defaultValue={new Date(2026, 3, 9)}
          />
        </div>
      </ShowcaseSection>

      <FormSectionCheckbox />

      <FormSectionRadioGroup />

      <ShowcaseSection title={t('showcase.switch.title')}>
        <div className="gap-sm flex items-center">
          <Switch
            id="notifications"
            checked={switchOn}
            onCheckedChange={setSwitchOn}
          />
          <Label htmlFor="notifications">
            {switchOn
              ? t('showcase.switch.notificationsOn')
              : t('showcase.switch.notificationsOff')}
          </Label>
        </div>
        <div className="gap-sm flex items-center">
          <Switch
            id="disabled-switch"
            disabled
          />
          <Label
            htmlFor="disabled-switch"
            className="opacity-50"
          >
            {t('showcase.switch.disabled')}
          </Label>
        </div>
      </ShowcaseSection>
    </>
  )
}
