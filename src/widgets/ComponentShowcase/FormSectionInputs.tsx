import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Input, Label } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Input and Label showcase for FormSection.
 * @returns A ShowcaseSection with various input/label variants and states.
 */
export function FormSectionInputs() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.inputLabel.title')}>
      <div className="gap-sm flex w-64 flex-col">
        <Label htmlFor="email">{t('showcase.inputLabel.emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('showcase.inputLabel.emailPlaceholder')}
        />
      </div>
      <div className="gap-sm flex w-64 flex-col">
        <Label htmlFor="disabled-input">{t('showcase.inputLabel.disabledLabel')}</Label>
        <Input
          id="disabled-input"
          placeholder={t('showcase.inputLabel.disabledPlaceholder')}
          disabled
        />
      </div>
      <div className="gap-sm flex w-64 flex-col">
        <Label htmlFor="required-input">
          {t('showcase.inputLabel.requiredLabel')}
          <span
            className="text-destructive text-xs"
            aria-hidden="true"
          >
            {
              // eslint-disable-next-line react/jsx-no-literals -- required field decoration
              '*'
            }
          </span>
        </Label>
        <Input
          id="required-input"
          placeholder={t('showcase.inputLabel.requiredPlaceholder')}
          aria-required="true"
        />
        <p className="text-muted-foreground text-xs">{t('showcase.inputLabel.requiredHint')}</p>
      </div>
      <div className="gap-sm flex w-64 flex-col">
        <Label htmlFor="currency-input">
          {t('showcase.inputLabel.currencyLabel')}
          <span className="text-muted-foreground text-xs font-normal">
            {t('showcase.inputLabel.currencyOptional')}
          </span>
        </Label>
        <div className="relative w-full">
          <span
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            aria-hidden="true"
          >
            {
              // eslint-disable-next-line react/jsx-no-literals -- currency symbol decoration
              '€'
            }
          </span>
          <Input
            id="currency-input"
            type="number"
            placeholder={t('showcase.inputLabel.currencyPlaceholder')}
            inputMode="decimal"
            className="pl-7"
          />
        </div>
      </div>
      <div className="gap-sm flex w-64 flex-col">
        <Label htmlFor="invalid-input">
          {t('showcase.inputLabel.invalidLabel')}
          <span
            className="text-destructive text-xs"
            aria-hidden="true"
          >
            {
              // eslint-disable-next-line react/jsx-no-literals -- required field decoration
              '*'
            }
          </span>
        </Label>
        <Input
          id="invalid-input"
          defaultValue={t('showcase.inputLabel.invalidValue')}
          aria-required="true"
          aria-invalid="true"
          aria-describedby="invalid-input-error"
        />
        <p
          id="invalid-input-error"
          className="text-destructive flex items-center gap-1 text-xs font-medium"
          role="alert"
        >
          <X className="h-3 w-3 shrink-0" />
          {t('showcase.inputLabel.invalidError')}
        </p>
      </div>
    </ShowcaseSection>
  )
}
