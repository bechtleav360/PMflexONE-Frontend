import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Combobox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Textarea,
} from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'

import type { StakeholderFormValues } from '../utils/stakeholderSchema'

/** Props for {@link StakeholderAnalysisFields}. */
export interface StakeholderAnalysisFieldsProps {
  /** When true, all fields are rendered in read-only / disabled state. */
  readOnly: boolean
  /** Options for the responsible member combobox. */
  memberOptions: ComboboxOption[]
  /** When true, the member combobox shows a loading indicator. */
  membersLoading: boolean
}

/**
 * Right-column analysis fields for the stakeholder form general tab.
 *
 * Renders type of affectedness, conflict potential, expectations,
 * inclusion measures, and responsible member picker fields.
 *
 * Uses `useFormContext` internally so the parent `<Form>` provider is required.
 *
 * @param props - Component props.
 * @param props.readOnly - When true all fields are disabled.
 * @param props.memberOptions - Combobox options for the responsible member picker.
 * @param props.membersLoading - When true the member combobox shows a loading indicator.
 * @returns The right-column analysis fields as a flex column div.
 */
// eslint-disable-next-line max-lines-per-function -- form-heavy component; verbosity is inherent to 6 FormField definitions for the analysis section
export function StakeholderAnalysisFields({
  readOnly,
  memberOptions,
  membersLoading,
}: StakeholderAnalysisFieldsProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<StakeholderFormValues>()

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="typeOfAffectedness"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.stakeholderRegister.form.typeOfAffectednessLabel')}</FormLabel>
            <Select
              value={field.value ?? undefined}
              onValueChange={field.onChange}
              disabled={readOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <span>
                    {t(`pages.stakeholderRegister.form.typeOfAffectednessOptions.${field.value}`)}
                  </span>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const).map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                  >
                    {t(`pages.stakeholderRegister.form.typeOfAffectednessOptions.${opt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="conflictPotential"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.stakeholderRegister.form.conflictPotentialLabel')}</FormLabel>
            <Select
              value={field.value ?? ''}
              onValueChange={(v) => field.onChange(v === '__CLEAR__' ? null : v || null)}
              disabled={readOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <span>
                    {field.value
                      ? t(`pages.stakeholderRegister.form.conflictPotentialOptions.${field.value}`)
                      : '—'}
                  </span>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__CLEAR__">
                  {t('pages.stakeholderRegister.form.conflictPotentialClear')}
                </SelectItem>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                  >
                    {t(`pages.stakeholderRegister.form.conflictPotentialOptions.${opt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="expectations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.stakeholderRegister.form.expectationsLabel')}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ''}
                disabled={readOnly}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="inclusionMeasures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.stakeholderRegister.form.inclusionMeasuresLabel')}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ''}
                disabled={readOnly}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Responsible member picker (T057) */}
      <FormField
        control={control}
        name="responsible"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.stakeholderRegister.form.responsibleLabel')}</FormLabel>
            <Combobox
              value={field.value ?? null}
              options={memberOptions}
              onChange={(value) => field.onChange(value ?? null)}
              placeholder={t('pages.stakeholderRegister.form.responsibleLabel')}
              noResultsText={t('pages.stakeholderRegister.form.responsibleNoResults')}
              loading={membersLoading}
              disabled={readOnly}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
