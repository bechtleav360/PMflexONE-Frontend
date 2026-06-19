import { type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Combobox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MarkdownEditor,
  type ComboboxOption,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import type { DeliverableFormValues } from '../../types/deliverable.types'

/** Sentinel value used to represent "no parent" (root level) in the Combobox. */
const ROOT_PARENT_VALUE = '__root__'

interface DeliverableFormFieldsProps {
  control: Control<DeliverableFormValues>
  isReadOnly: boolean
  isSaving: boolean
  personsLoading: boolean
  parentOptions: ComboboxOption[]
  ownerOptions: ComboboxOption[]
  mode: 'create' | 'edit' | 'read'
}

/**
 * Renders the six form fields for the deliverable create / edit / read-only modal.
 *
 * Extracted from `DeliverableFormModal` to keep that component under the
 * 300-line refactor trigger. All logic lives in `useDeliverableFormState`.
 *
 * @param props - Form control, read/save state, and option lists.
 * @returns A fragment containing the six `FormField` / `Controller` blocks.
 */
// Justified: six form fields, each requiring FormField/Controller + FormItem/Label/Control/Message
// structure. No further extraction is practical without over-fragmenting a single form.
// eslint-disable-next-line max-lines-per-function -- six form fields each requiring FormField/Controller + FormItem/Label/Control/Message; no further extraction is practical without over-fragmenting a single form
export function DeliverableFormFields({
  control,
  isReadOnly,
  isSaving,
  personsLoading,
  parentOptions,
  ownerOptions,
  mode,
}: DeliverableFormFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('features.deliverablesManagement.fields.name')}
              <span
                className="text-destructive ml-0.5"
                aria-hidden="true"
              >
                {REQUIRED_MARKER}
              </span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={isReadOnly || isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Business ID */}
      <FormField
        control={control}
        name="businessId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.deliverablesManagement.fields.businessId')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                disabled={isReadOnly || isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Parent */}
      <FormField
        control={control}
        name="parentId"
        render={({ field }) => {
          const rootOption: ComboboxOption = {
            value: ROOT_PARENT_VALUE,
            label: t('features.deliverablesManagement.fields.parentRoot'),
          }
          const parentOptionsWithRoot = [rootOption, ...parentOptions]
          return (
            <FormItem>
              <FormLabel>{t('features.deliverablesManagement.fields.parent')}</FormLabel>
              <FormControl>
                <Combobox
                  value={field.value ?? ROOT_PARENT_VALUE}
                  onChange={(v) => field.onChange(v === ROOT_PARENT_VALUE ? null : v)}
                  options={parentOptionsWithRoot}
                  disabled={isReadOnly || isSaving || mode === 'edit'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {/* Owner */}
      <FormField
        control={control}
        name="ownerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.deliverablesManagement.fields.owner')}</FormLabel>
            <FormControl>
              <Combobox
                value={field.value ?? null}
                onChange={field.onChange}
                options={ownerOptions}
                loading={personsLoading}
                disabled={isReadOnly || isSaving}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.deliverablesManagement.fields.description')}</FormLabel>
            <FormControl>
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
                disabled={isReadOnly || isSaving}
                ariaLabel={t('features.deliverablesManagement.fields.description')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Other information */}
      <FormField
        control={control}
        name="otherInformation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('features.deliverablesManagement.fields.otherInformation')}</FormLabel>
            <FormControl>
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v || null)}
                disabled={isReadOnly || isSaving}
                ariaLabel={t('features.deliverablesManagement.fields.otherInformation')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
