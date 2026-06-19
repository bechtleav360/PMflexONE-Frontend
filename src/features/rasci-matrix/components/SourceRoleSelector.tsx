import { useTranslation } from 'react-i18next'

import type { MatrixRole } from '@/entities/role'
import {
  FormControl,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

interface SourceRoleSelectorProps {
  /** Template roles available for selection. */
  templateRoles: MatrixRole[]
  /** Whether the selector is disabled. */
  isPending: boolean
  /** Called with the selected role ID when the user picks a role. */
  onValueChange: (roleId: string) => void
}

/**
 * Source-role selector that pre-fills task permissions from a selected template role.
 *
 * @param props - Selector configuration.
 * @returns The rendered source role selector form item.
 */
export function SourceRoleSelector({
  templateRoles,
  isPending,
  onValueChange,
}: SourceRoleSelectorProps) {
  const { t } = useTranslation()
  return (
    <FormItem>
      <FormLabel htmlFor="source-role-select">
        {t('pages.rasciMatrix.sourceRole', 'Source role (template)')}
      </FormLabel>
      <Select
        onValueChange={onValueChange}
        disabled={isPending}
      >
        <FormControl>
          <SelectTrigger id="source-role-select">
            <SelectValue
              placeholder={t('pages.rasciMatrix.selectTemplateRole', 'Select template role')}
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {templateRoles.map((role) => (
            <SelectItem
              key={role.id}
              value={role.id}
            >
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormItem>
  )
}
