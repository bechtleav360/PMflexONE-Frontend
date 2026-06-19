import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MatrixRole, RoleGroup } from '@/entities/role'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import { resolveGroupStyle } from './lib/resolveGroupStyle'

interface RoleHeaderRowsProps {
  roles: MatrixRole[]
  orderedGroupIds: string[]
  roleGroupMap: Map<string, RoleGroup>
  isReadOnly: boolean
  onEditRole: (roleId: string) => void
  onDeleteRole: (roleId: string) => void
}

/**
 * Renders the two role header rows inside the matrix `<thead>`:
 * 1. A group-span row with coloured group headers.
 * 2. A per-role column row with short title, edit, and delete actions.
 *
 * @param props - Component props.
 * @returns Two `<tr>` elements for the role header section.
 */
export function RoleHeaderRows({
  roles,
  orderedGroupIds,
  roleGroupMap,
  isReadOnly,
  onEditRole,
  onDeleteRole,
}: RoleHeaderRowsProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* Row 1: Individual role headers — shortTitle + tooltip + edit/delete */}
      <tr>
        {roles.map((role) => {
          const idx = orderedGroupIds.indexOf(role.groupId)
          const group = roleGroupMap.get(role.groupId)
          const { cellClass, cellStyle } = resolveGroupStyle(group?.color, idx)
          return (
            <th
              key={role.id}
              scope="col"
              className={`group border-border border px-1 py-1.5 text-center align-middle ${cellClass}`}
              style={cellStyle}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={role.name}
                    className="block w-full cursor-default border-0 bg-transparent p-0 text-xs font-semibold select-none"
                  >
                    {role.shortTitle}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{role.name}</TooltipContent>
              </Tooltip>
              <div className="mt-1 flex h-[24px] items-center justify-center gap-1">
                {!isReadOnly && !role.isFixed && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-6 w-6 transition-colors"
                      aria-label={t('pages.roleManagement.editRole', 'Edit role')}
                      onClick={() => onEditRole(role.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive h-6 w-6 transition-colors"
                      aria-label={t('pages.roleManagement.deleteRole', 'Delete role')}
                      onClick={() => onDeleteRole(role.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </th>
          )
        })}
      </tr>

      {/* Row 2: RoleGroup spans — saturated header color */}
      <tr>
        {orderedGroupIds.map((groupId, idx) => {
          const groupRoles = roles.filter((r) => r.groupId === groupId)
          const group = roleGroupMap.get(groupId)
          const { headerClass, headerStyle } = resolveGroupStyle(group?.color, idx)
          return (
            <th
              key={groupId}
              scope="col"
              colSpan={groupRoles.length}
              className={`border-border border px-2 py-1.5 text-center text-xs font-semibold ${headerClass}`}
              style={headerStyle}
            >
              {group?.name ?? groupId}
            </th>
          )
        })}
      </tr>
    </>
  )
}
