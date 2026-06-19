import type { Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { RoleGroup } from '@/entities/role'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import type { ObjectRoleFormValues } from './ObjectRoleForm'

interface GroupFieldProps {
  /** RHF control instance for the form. */
  control: Control<ObjectRoleFormValues>
  /** Available role groups for selection. */
  roleGroups: RoleGroup[]
  /** Whether the field is disabled. */
  isPending: boolean
}

/**
 * Group selector field for the object role form.
 *
 * @param props - Field configuration.
 * @returns The rendered group select form field.
 */
export function GroupField({ control, roleGroups, isPending }: GroupFieldProps) {
  const { t } = useTranslation()
  return (
    <FormField
      control={control}
      name="groupId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('pages.roleManagement.roleGroupLabel', 'Group')}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isPending}
          >
            <FormControl>
              <SelectTrigger aria-label={t('pages.roleManagement.roleGroupLabel', 'Group')}>
                <SelectValue placeholder={t('pages.roleManagement.roleGroupLabel', 'Group')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {roleGroups.map((group) => (
                <SelectItem
                  key={group.id}
                  value={group.id}
                >
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
