import { ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MatrixTask, ResolvedMatrixColumn, TaskGroup } from '@/entities/role'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import { useRasciMatrixStore } from '../store/rasciMatrixStore'

interface RasciTaskGroupRowProps {
  taskGroup: TaskGroup
  groupTasks: MatrixTask[]
  sortedColumns: ResolvedMatrixColumn[]
  canEdit: boolean
}

/**
 * A sticky group-header row in the RASCI matrix table.
 * Shows the task group name and, for each column, a bulk-override button that
 * opens the bulk override dialog pre-filtered to the group's tasks.
 *
 * @param props - Component props.
 * @returns The rendered `<tr>` group header row.
 */
export function RasciTaskGroupRow({
  taskGroup,
  groupTasks,
  sortedColumns,
  canEdit,
}: RasciTaskGroupRowProps) {
  const { t } = useTranslation()
  const { openBulkOverrideForTaskGroup } = useRasciMatrixStore()

  return (
    <tr>
      <td className="border-border rasci-task-group-header sticky left-0 z-10 border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
        {taskGroup.name}
      </td>
      {canEdit &&
        sortedColumns.map((col) => {
          const cells = groupTasks.map((task) => ({ roleId: col.role.id, taskId: task.id }))
          return (
            <td
              key={`group-btn-${taskGroup.id}-${col.role.id}`}
              className="border-border rasci-task-group-header border p-0 text-center"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('pages.roleManagement.setGroupForRole', {
                      roleName: col.role.shortTitle,
                      groupName: taskGroup.name,
                      defaultValue: 'Set all "{{groupName}}" values for {{roleName}}',
                    })}
                    onClick={() => openBulkOverrideForTaskGroup(cells, taskGroup.name)}
                    className="focus-visible:ring-ring flex h-full min-h-[28px] w-full cursor-pointer items-center justify-center opacity-60 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <ChevronsUpDown
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('pages.roleManagement.setGroupForRole', {
                    roleName: col.role.shortTitle,
                    groupName: taskGroup.name,
                    defaultValue: 'Set all "{{groupName}}" values for {{roleName}}',
                  })}
                </TooltipContent>
              </Tooltip>
            </td>
          )
        })}
      {!canEdit && (
        <td
          colSpan={sortedColumns.length}
          className="border-border rasci-task-group-header border"
        />
      )}
    </tr>
  )
}
