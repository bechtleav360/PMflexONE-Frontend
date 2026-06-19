import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/shared/components'

import type { ObjectRoleFormValues } from './ObjectRoleForm'

interface RoleTextFieldsProps {
  /** RHF control instance for the form. */
  control: Control<ObjectRoleFormValues>
  /** Whether the fields are disabled. */
  isPending: boolean
}

/**
 * Name, shortTitle, and description form fields for the object role form.
 *
 * @param props - Field configuration.
 * @returns The rendered text form fields.
 */
export function RoleTextFields({ control, isPending }: RoleTextFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.roleManagement.roleNameLabel', 'Name')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="shortTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.roleManagement.roleShortTitleLabel', 'Short title')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                maxLength={10}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('pages.roleManagement.roleDescriptionLabel', 'Description')}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
