import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Checkbox, Label } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for checkbox controls.
 * @returns A section demonstrating controlled and disabled checkbox states.
 */
export function FormSectionCheckbox() {
  const [acceptTerms, setAcceptTerms] = useState(true)
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.checkbox.title')}>
      <div className="gap-sm flex items-center">
        <Checkbox
          id="showcase-checkbox"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked === true)}
        />
        <Label htmlFor="showcase-checkbox">{t('showcase.checkbox.label')}</Label>
      </div>
      <p
        aria-live="polite"
        aria-atomic="true"
        className="text-muted-foreground text-sm"
        role="status"
      >
        {acceptTerms ? t('showcase.checkbox.checked') : t('showcase.checkbox.unchecked')}
      </p>
      <div className="gap-sm flex items-center">
        <Checkbox
          id="showcase-checkbox-disabled"
          disabled
        />
        <Label
          htmlFor="showcase-checkbox-disabled"
          className="opacity-50"
        >
          {t('showcase.checkbox.disabled')}
        </Label>
      </div>
    </ShowcaseSection>
  )
}
