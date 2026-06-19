import React from 'react'

import { ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MatrixRole, MatrixTask, PermissionKey, TaskGroup } from '@/entities/role'
import type { BulkSelectedCell } from '@/features/role-management'
import { RasciValueBadge, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

interface TaskGroupRowsProps {
  orderedTaskGroupIds: (string | null)[]
  tasksByGroup: Map<string | null, MatrixTask[]>
  ungroupedTasks: MatrixTask[]
  taskGroupMap: Map<string, TaskGroup>
  roles: MatrixRole[]
  bulkSelectedCells: Map<string, BulkSelectedCell>
  isReadOnly: boolean
  onCellClick: (e: React.MouseEvent, roleId: string, taskId: string, value: PermissionKey) => void
  onBulkEditForTaskGroup: (cells: { roleId: string; taskId: string }[], groupName: string) => void
}

type TaskRowsT = ReturnType<typeof useTranslation>['t']

function renderTaskRows(
  taskList: MatrixTask[],
  roles: MatrixRole[],
  bulkSelectedCells: Map<string, BulkSelectedCell>,
  isReadOnly: boolean,
  onCellClick: TaskGroupRowsProps['onCellClick'],
  t: TaskRowsT,
) {
  return taskList.map((task) => (
    <tr
      key={task.id}
      className="hover:bg-muted/30"
      data-testid="rasci-task-row"
    >
      <td className="bg-background border-border sticky left-0 z-10 max-w-[220px] truncate border px-3 py-1.5 text-sm font-medium whitespace-nowrap">
        {task.name}
      </td>
      {roles.map((role) => {
        const permission = role.tasks.find((tp) => tp.taskId === task.id)
        const value = (permission?.permissionKey ?? '—') as PermissionKey
        const cellKey = `${role.id}:${task.id}`
        const isSelected = bulkSelectedCells.has(cellKey)
        return (
          <td
            key={role.id}
            className="border-border border p-0 text-center"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t('pages.rasciMatrix.cellAriaLabel', {
                    roleName: role.shortTitle,
                    taskName: task.name,
                    value,
                  })}
                  className={[
                    'focus-visible:ring-ring flex min-h-[44px] w-full min-w-[44px] items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    isReadOnly
                      ? 'bg-accent/10 cursor-default'
                      : isSelected
                        ? 'bg-primary/20 ring-primary cursor-pointer ring-2 ring-inset'
                        : 'bg-accent/10 hover:bg-accent/60 cursor-pointer',
                  ].join(' ')}
                  onClick={(e) => onCellClick(e, role.id, task.id, value)}
                >
                  <RasciValueBadge value={value} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-56 space-y-0.5 whitespace-normal">
                <div className="font-semibold">
                  {t(`pages.roleManagement.rasciLegend.${value}`)}
                </div>
                {task.resources
                  .map((r) => {
                    const opk = r.operationsByKey.find((o) => o.permissionKey === value)
                    if (!opk) return null
                    const ops = opk.operations
                      .map((op) => t(`pages.rasciMatrix.operations.${op}`, op))
                      .join(', ')
                    return (
                      <div
                        key={r.name}
                        className="opacity-75"
                      >
                        {[r.name, ops].join(': ')}
                      </div>
                    )
                  })
                  .filter(Boolean)}
              </TooltipContent>
            </Tooltip>
          </td>
        )
      })}
    </tr>
  ))
}

/**
 * Renders all task rows grouped by task group for the role management detail matrix.
 * Emits a sticky group-header row with a bulk-edit trigger for each group,
 * followed by individual task rows with per-cell RASCI value buttons.
 *
 * @param props - Component props.
 * @returns A React fragment containing all group header and task `<tr>` elements.
 */
export function TaskGroupRows({
  orderedTaskGroupIds,
  tasksByGroup,
  ungroupedTasks,
  taskGroupMap,
  roles,
  bulkSelectedCells,
  isReadOnly,
  onCellClick,
  onBulkEditForTaskGroup,
}: TaskGroupRowsProps) {
  const { t } = useTranslation()

  return (
    <>
      {orderedTaskGroupIds.map((groupId) => {
        const groupTasks = groupId === null ? ungroupedTasks : (tasksByGroup.get(groupId) ?? [])
        if (groupTasks.length === 0) return null
        const group = groupId ? taskGroupMap.get(groupId) : null

        return (
          <React.Fragment key={groupId ?? '__ungrouped'}>
            {group && (
              <tr>
                <td className="border-border rasci-task-group-header sticky left-0 z-10 border px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
                  {group.name}
                </td>
                {roles.map((role) => {
                  const cells = groupTasks.map((task) => ({ roleId: role.id, taskId: task.id }))
                  return (
                    <td
                      key={`group-btn-${group.id}-${role.id}`}
                      className="border-border rasci-task-group-header border p-0 text-center"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label={t('pages.roleManagement.setGroupForRole', {
                              roleName: role.shortTitle,
                              groupName: group.name,
                              defaultValue: 'Set all "{{groupName}}" values for {{roleName}}',
                            })}
                            onClick={() => onBulkEditForTaskGroup(cells, group.name)}
                            className="focus-visible:ring-ring flex h-full min-h-[28px] w-full cursor-pointer items-center justify-center text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:outline-none"
                          >
                            <ChevronsUpDown
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t('pages.roleManagement.setGroupForRole', {
                            roleName: role.shortTitle,
                            groupName: group.name,
                            defaultValue: 'Set all "{{groupName}}" values for {{roleName}}',
                          })}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  )
                })}
              </tr>
            )}
            {renderTaskRows(groupTasks, roles, bulkSelectedCells, isReadOnly, onCellClick, t)}
          </React.Fragment>
        )
      })}
    </>
  )
}
