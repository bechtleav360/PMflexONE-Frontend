import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { PersonPicker } from '@/shared/components'
import type { PersonResult } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

const DEMO_PERSONS: PersonResult[] = [
  { id: '1', firstName: 'Alice', lastName: 'Müller', mail: 'alice.mueller@example.com' },
  { id: '2', firstName: 'Bob', lastName: 'Schmidt', mail: 'bob.schmidt@example.com' },
  { id: '3', firstName: 'Clara', lastName: 'Weber', mail: 'clara.weber@example.com' },
  { id: '4', firstName: 'David', lastName: 'Fischer', mail: 'david.fischer@example.com' },
  { id: '5', firstName: 'Eva', lastName: 'Bauer', mail: 'eva.bauer@example.com' },
  { id: '6', firstName: 'Felix', lastName: 'Koch', mail: 'felix.koch@example.com' },
]

async function searchPersons(query: string): Promise<PersonResult[]> {
  await new Promise((r) => setTimeout(r, 300))
  const q = query.trim().toLowerCase()
  if (q === '') return DEMO_PERSONS
  return DEMO_PERSONS.filter(
    (p) =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.mail?.toLowerCase().includes(q) ?? false),
  )
}

// Pre-seeded selection for the "pre-filled" single-select example.
const PREFILLED_PERSON = DEMO_PERSONS[1]

/**
 * Showcase section demonstrating the PersonPicker in single-select, multi-select,
 * and pre-filled modes.
 *
 * @returns Interactive PersonPicker examples.
 */
export function PersonPickerSection() {
  const { t } = useTranslation()

  const [singleValue, setSingleValue] = useState<string | null>(null)
  const [multiValues, setMultiValues] = useState<string[]>([])
  const [prefilledValue, setPrefilledValue] = useState<string | null>(PREFILLED_PERSON.id)

  const singleSelected = DEMO_PERSONS.find((p) => p.id === singleValue)
  const multiSelected = multiValues
    .map((id) => DEMO_PERSONS.find((p) => p.id === id))
    .filter((p): p is PersonResult => p !== undefined)

  return (
    <ShowcaseSection title={t('showcase.personPicker.title')}>
      <div className="gap-xl flex w-full max-w-sm flex-col">
        {/* Single-select */}
        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.personPicker.singleLabel')}
          </p>
          <PersonPicker
            value={singleValue}
            onChange={setSingleValue}
            onSearch={searchPersons}
            pageSize={6}
            storageKey="showcase-person-picker-single"
          />
          <p className="text-muted-foreground text-xs">
            {singleSelected
              ? t('showcase.personPicker.selected', {
                  name: `${singleSelected.firstName} ${singleSelected.lastName}`,
                })
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>

        {/* Multi-select */}
        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.personPicker.multiLabel')}
          </p>
          <PersonPicker
            multiple
            values={multiValues}
            onChangeValues={setMultiValues}
            onSearch={searchPersons}
            pageSize={6}
            storageKey="showcase-person-picker-multi"
          />
          <p className="text-muted-foreground text-xs">
            {multiSelected.length > 0
              ? multiSelected.map((p) => `${p.firstName} ${p.lastName}`).join(', ')
              : t('showcase.combobox.noneSelected')}
          </p>
        </div>

        {/* Pre-filled single-select */}
        <div className="gap-sm flex flex-col">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('showcase.personPicker.preFilledLabel')}
          </p>
          <PersonPicker
            value={prefilledValue}
            onChange={setPrefilledValue}
            onSearch={searchPersons}
            pageSize={6}
            storageKey="showcase-person-picker-prefilled"
            resolvedPersons={[PREFILLED_PERSON]}
          />
          <p className="text-muted-foreground text-xs">{t('showcase.personPicker.description')}</p>
        </div>
      </div>
    </ShowcaseSection>
  )
}
