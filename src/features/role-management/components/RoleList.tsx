import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MatrixRole, RoleGroup } from '@/entities/role'
import { Button } from '@/shared/components'

import { useRoleManagementStore } from '../store/roleManagementStore'
import { RoleListItem } from './RoleListItem'

interface RoleListProps {
  /** Roles to display. */
  roles: MatrixRole[]
  /** All role groups (for grouping display). */
  roleGroups: RoleGroup[]
}

/**
 * Displays roles grouped by role group, with Add, Edit, and Delete actions.
 * Hides Edit/Delete for fixed (system-defined) roles.
 * Shows an empty state message when no roles exist.
 *
 * @param props - Component props.
 * @returns The rendered role list.
 */
export function RoleList({ roles, roleGroups }: RoleListProps) {
  const { t } = useTranslation()
  const { openAddRole, openEditRole, openDeleteRole } = useRoleManagementStore()

  // Group roles by groupId
  const rolesByGroup = roleGroups.map((group) => ({
    group,
    roles: roles.filter((r) => r.groupId === group.id),
  }))

  // Roles without a matching group
  const ungroupedRoles = roles.filter((r) => !roleGroups.some((g) => g.id === r.groupId))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={openAddRole}
        >
          <Plus
            className="mr-1 h-4 w-4"
            aria-hidden="true"
          />
          {t('pages.roleManagement.addRole')}
        </Button>
      </div>

      {roles.length === 0 && (
        <p className="text-muted-foreground text-sm">{t('pages.roleManagement.noRoles')}</p>
      )}

      {rolesByGroup.map(({ group, roles: groupRoles }) => (
        <section key={group.id}>
          <h3 className="mb-2 text-sm font-semibold">{group.name}</h3>
          <ul className="space-y-1">
            {groupRoles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                onEdit={openEditRole}
                onDelete={openDeleteRole}
                editLabel={t('pages.roleManagement.editRole')}
                deleteLabel={t('pages.roleManagement.deleteRole')}
              />
            ))}
          </ul>
        </section>
      ))}

      {ungroupedRoles.length > 0 && (
        <section aria-label={t('pages.roleManagement.ungroupedRoles')}>
          <ul className="space-y-1">
            {ungroupedRoles.map((role) => (
              <RoleListItem
                key={role.id}
                role={role}
                onEdit={openEditRole}
                onDelete={openDeleteRole}
                editLabel={t('pages.roleManagement.editRole')}
                deleteLabel={t('pages.roleManagement.deleteRole')}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
