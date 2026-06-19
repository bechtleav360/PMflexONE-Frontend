import type React from 'react'

import { useTranslation } from 'react-i18next'

import type { MatrixRole, MatrixTask, PermissionKey, RoleGroup, TaskGroup } from '@/entities/role'
import type { BulkSelectedCell } from '@/features/role-management'
import { MatrixTable } from '@/shared/components'

import { RoleHeaderRows } from './RoleHeaderRows'
import { TaskGroupRows } from './TaskGroupRows'

interface RoleManagementMatrixProps {
  /** Roles to display as columns. */
  roles: MatrixRole[]
  /** Tasks to display as rows. */
  tasks: MatrixTask[]
  /** Ordered group IDs for column grouping. */
  orderedGroupIds: string[]
  /** Map of group ID to RoleGroup. */
  roleGroupMap: Map<string, RoleGroup>
  /** Ordered task group IDs for row grouping. */
  orderedTaskGroupIds: (string | null)[]
  /** Map of task group ID to TaskGroup. */
  taskGroupMap: Map<string, TaskGroup>
  /** Map of group ID to task list. */
  tasksByGroup: Map<string | null, MatrixTask[]>
  /** Tasks not belonging to any group. */
  ungroupedTasks: MatrixTask[]
  /** Currently bulk-selected cells. */
  bulkSelectedCells: Map<string, BulkSelectedCell>
  /** Whether the matrix is read-only. */
  isReadOnly: boolean
  /** Called when a cell is clicked. */
  onCellClick: (e: React.MouseEvent, roleId: string, taskId: string, value: PermissionKey) => void
  /** Called when bulk edit is requested for a task group. */
  onBulkEditForTaskGroup: (cells: { roleId: string; taskId: string }[], groupName: string) => void
  /** Called when user clicks edit on a role. */
  onEditRole: (roleId: string) => void
  /** Called when user clicks delete on a role. */
  onDeleteRole: (roleId: string) => void
}

/**
 * Matrix table section of the role management detail page.
 * Only rendered when both roles and tasks are present.
 *
 * @param props - Matrix configuration.
 * @returns The rendered matrix table, or null when roles or tasks are empty.
 */
export function RoleManagementMatrix({
  roles,
  tasks,
  orderedGroupIds,
  roleGroupMap,
  orderedTaskGroupIds,
  taskGroupMap,
  tasksByGroup,
  ungroupedTasks,
  bulkSelectedCells,
  isReadOnly,
  onCellClick,
  onBulkEditForTaskGroup,
  onEditRole,
  onDeleteRole,
}: RoleManagementMatrixProps) {
  const { t } = useTranslation()

  if (roles.length === 0 || tasks.length === 0) return null

  return (
    <MatrixTable>
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
            colSpan={roles.length}
            className="border-border bg-border border px-3 py-1.5 text-center text-xs font-semibold tracking-wide uppercase"
          >
            {t('pages.roleManagement.rolesColumn', 'Roles')}
          </th>
        </tr>
        <RoleHeaderRows
          roles={roles}
          orderedGroupIds={orderedGroupIds}
          roleGroupMap={roleGroupMap}
          isReadOnly={isReadOnly}
          onEditRole={onEditRole}
          onDeleteRole={onDeleteRole}
        />
      </thead>
      <tbody>
        <TaskGroupRows
          orderedTaskGroupIds={orderedTaskGroupIds}
          tasksByGroup={tasksByGroup}
          ungroupedTasks={ungroupedTasks}
          taskGroupMap={taskGroupMap}
          roles={roles}
          bulkSelectedCells={bulkSelectedCells}
          isReadOnly={isReadOnly}
          onCellClick={onCellClick}
          onBulkEditForTaskGroup={onBulkEditForTaskGroup}
        />
      </tbody>
    </MatrixTable>
  )
}
