import { useTranslation } from 'react-i18next'

import type { ResolvedMatrixColumn, RoleGroup } from '@/entities/role'

import { resolveGroupStyle } from '../lib/groupStyle'
import { RasciColumnHeader } from './RasciColumnHeader'

interface RasciMatrixHeadProps {
  sortedColumns: ResolvedMatrixColumn[]
  orderedRoleGroups: RoleGroup[]
  groupPaletteIndex: Map<string, number>
}

/**
 * Renders the `<thead>` for the RASCI matrix table.
 * Produces two header rows: role-group colspan headers and per-column role headers.
 *
 * @param props - Component props.
 * @returns The rendered table head element.
 */
export function RasciMatrixHead({
  sortedColumns,
  orderedRoleGroups,
  groupPaletteIndex,
}: RasciMatrixHeadProps) {
  const { t } = useTranslation()

  return (
    <thead>
      <tr>
        <th
          scope="col"
          rowSpan={3}
          className="rasci-task-th bg-border border-border sticky left-0 z-20 border px-3 py-2 text-left align-bottom text-xs font-semibold tracking-wide uppercase"
        >
          {t('pages.roleManagement.taskColumn', 'Task')}
        </th>
        <th
          scope="colgroup"
          colSpan={sortedColumns.length}
          className="border-border bg-border border px-3 py-1.5 text-center text-xs font-semibold tracking-wide uppercase"
        >
          {t('pages.roleManagement.rolesColumn', 'Roles')}
        </th>
      </tr>

      <tr>
        {sortedColumns.map((col) => {
          const idx = groupPaletteIndex.get(col.role.groupId) ?? 0
          const { cellClass, cellStyle } = resolveGroupStyle(col.group, idx)
          return (
            <RasciColumnHeader
              key={col.role.id}
              role={col.role}
              hasAnyOverride={col.hasAnyOverride}
              isCustomRole={col.isCustomRole}
              paletteClass={cellClass}
              cellStyle={cellStyle}
            />
          )
        })}
      </tr>

      <tr>
        {orderedRoleGroups.map((group, idx) => {
          const groupCols = sortedColumns.filter((c) => c.group?.id === group.id)
          if (groupCols.length === 0) return null
          const { headerClass, headerStyle } = resolveGroupStyle(group, idx)
          return (
            <th
              key={group.id}
              scope="colgroup"
              colSpan={groupCols.length}
              className={`border-border border px-2 py-1.5 text-center text-xs font-semibold ${headerClass}`}
              style={headerStyle}
            >
              {group.name}
            </th>
          )
        })}
        {sortedColumns
          .filter((c) => c.group === null)
          .map((col) => (
            <th
              key={`ungrouped-${col.role.id}`}
              scope="col"
              className="border-border border px-2 py-1.5"
            />
          ))}
      </tr>
    </thead>
  )
}
