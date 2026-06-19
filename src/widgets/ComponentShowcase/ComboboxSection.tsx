import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Combobox } from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
]

const GROUPED_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'nest', label: 'NestJS', group: 'Backend' },
  { value: 'express', label: 'Express', group: 'Backend' },
  { value: 'fastify', label: 'Fastify', group: 'Backend' },
]

const COUNTRY_POOL: ComboboxOption[] = [
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'at', label: 'Austria' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'be', label: 'Belgium' },
  { value: 'pl', label: 'Poland' },
  { value: 'es', label: 'Spain' },
  { value: 'it', label: 'Italy' },
  { value: 'pt', label: 'Portugal' },
]

async function searchCountries(query: string): Promise<ComboboxOption[]> {
  await new Promise((r) => setTimeout(r, 400))
  const q = query.trim().toLowerCase()
  return q === '' ? COUNTRY_POOL : COUNTRY_POOL.filter((c) => c.label.toLowerCase().includes(q))
}

/**
 * Showcase section demonstrating the three Combobox modes: static, async, and creatable.
 *
 * @returns Interactive Combobox examples grouped by mode.
 */
export function ComboboxSection() {
  const { t } = useTranslation()

  const [staticValue, setStaticValue] = useState<string | null>(null)
  const [groupedValue, setGroupedValue] = useState<string | null>(null)
  const [asyncValue, setAsyncValue] = useState<string | null>(null)
  const [creatableTags, setCreatableTags] = useState<ComboboxOption[]>([
    { value: 'bug', label: 'bug' },
    { value: 'feature', label: 'feature' },
    { value: 'docs', label: 'docs' },
  ])
  const [creatableValue, setCreatableValue] = useState<string | null>(null)

  const handleCreateTag = (query: string) => {
    const newTag: ComboboxOption = { value: query.toLowerCase(), label: query }
    setCreatableTags((prev) => [...prev, newTag])
    setCreatableValue(newTag.value)
  }

  return (
    <ShowcaseSection title={t('showcase.combobox.title')}>
      <div className="gap-xl flex w-full max-w-sm flex-col">
        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.combobox.staticTitle')}
          </p>
          <Combobox
            options={FRAMEWORK_OPTIONS}
            value={staticValue}
            onChange={setStaticValue}
            placeholder={t('showcase.combobox.staticPlaceholder')}
          />
          <p className="text-muted-foreground text-xs">
            {staticValue
              ? t('showcase.combobox.selected', { value: staticValue })
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>

        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.combobox.groupedTitle')}
          </p>
          <Combobox
            options={GROUPED_OPTIONS}
            value={groupedValue}
            onChange={setGroupedValue}
            placeholder={t('showcase.combobox.groupedPlaceholder')}
          />
          <p className="text-muted-foreground text-xs">
            {groupedValue
              ? t('showcase.combobox.selected', { value: groupedValue })
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>

        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.combobox.asyncTitle')}
          </p>
          <Combobox
            onSearch={searchCountries}
            value={asyncValue}
            onChange={setAsyncValue}
            placeholder={t('showcase.combobox.asyncPlaceholder')}
          />
          <p className="text-muted-foreground text-xs">
            {asyncValue
              ? t('showcase.combobox.selected', { value: asyncValue })
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>

        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.combobox.creatableTitle')}
          </p>
          <Combobox
            options={creatableTags}
            value={creatableValue}
            onChange={setCreatableValue}
            onCreate={handleCreateTag}
            createText={(q) => t('showcase.combobox.createText', { query: q })}
            placeholder={t('showcase.combobox.creatablePlaceholder')}
          />
          <p className="text-muted-foreground text-xs">
            {creatableValue
              ? t('showcase.combobox.selected', { value: creatableValue })
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>
      </div>
    </ShowcaseSection>
  )
}
