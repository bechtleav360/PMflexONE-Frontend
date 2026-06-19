import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components'

import type { StakeholderFormValues } from '../utils/stakeholderSchema'

/** Props for {@link StakeholderContactTab}. */
export interface StakeholderContactTabProps {
  /** When true, all fields are rendered in read-only / disabled state. */
  readOnly: boolean
}

/**
 * Contact tab content for the stakeholder form.
 *
 * Renders preferred communication type, email (up to 3), and phone (up to 3)
 * fields with conditional visibility — email2 appears once email is filled,
 * email3 once email2 is filled, and likewise for phone fields.
 *
 * Uses `useFormContext` internally so the parent `<Form>` provider is required.
 *
 * @param props - Component props.
 * @param props.readOnly - When true all fields are disabled.
 * @returns The contact tab body without its wrapping `<TabsContent>`.
 */
// eslint-disable-next-line max-lines-per-function -- form-heavy component; verbosity is inherent to 7 separate FormField definitions for the contact section
export function StakeholderContactTab({ readOnly }: StakeholderContactTabProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<StakeholderFormValues>()

  const watchedEmail = useWatch({ control, name: 'email' })
  const watchedEmail2 = useWatch({ control, name: 'email2' })
  const watchedPhone = useWatch({ control, name: 'phone' })
  const watchedPhone2 = useWatch({ control, name: 'phone2' })

  const showEmail2 = Boolean(watchedEmail)
  const showEmail3 = Boolean(watchedEmail2)
  const showPhone2 = Boolean(watchedPhone)
  const showPhone3 = Boolean(watchedPhone2)

  return (
    <div className="flex flex-col gap-4">
      {/* Bevorzugter Kommunikationstyp */}
      <FormField
        control={control}
        name="preferredCommunicationType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('pages.stakeholderRegister.form.preferredCommunicationTypeLabel')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                disabled={readOnly}
                maxLength={100}
                placeholder={t(
                  'pages.stakeholderRegister.form.preferredCommunicationTypePlaceholder',
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-8">
        {/* Email column */}
        <div className="flex flex-col gap-3">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pages.stakeholderRegister.form.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    value={field.value ?? ''}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showEmail2 && (
            <FormField
              control={control}
              name="email2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.stakeholderRegister.form.email2Label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      value={field.value ?? ''}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showEmail3 && (
            <FormField
              control={control}
              name="email3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.stakeholderRegister.form.email3Label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      value={field.value ?? ''}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Phone column */}
        <div className="flex flex-col gap-3">
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pages.stakeholderRegister.form.phoneLabel')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showPhone2 && (
            <FormField
              control={control}
              name="phone2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.stakeholderRegister.form.phone2Label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showPhone3 && (
            <FormField
              control={control}
              name="phone3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pages.stakeholderRegister.form.phone3Label')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  )
}
