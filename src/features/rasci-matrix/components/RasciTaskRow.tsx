import type { MatrixTask, ResolvedMatrixColumn } from '@/entities/role'

import { RasciCell } from './RasciCell'

interface RasciTaskRowProps {
  /** The task for this row. */
  task: MatrixTask
  /** Sorted columns used to render the cells. */
  sortedColumns: ResolvedMatrixColumn[]
  /** Map of roleId → taskId → cell data, for fast cell lookup. */
  cellMap: Map<
    string,
    Map<string, { currentValue: string; isOverridden: boolean; templateValue: string | null }>
  >
  /** Whether the current user can edit cell values. */
  canEdit: boolean
}

/**
 * A single task row in the RASCI matrix table.
 * Renders a sticky task-name cell followed by one `RasciCell` per role column.
 *
 * @param props - Row configuration.
 * @returns The rendered table row.
 */
export function RasciTaskRow({ task, sortedColumns, cellMap, canEdit }: RasciTaskRowProps) {
  return (
    <tr
      className="hover:bg-muted/30"
      data-testid="rasci-task-row"
    >
      <td className="bg-background border-border sticky left-0 z-10 max-w-[220px] truncate border px-3 py-1.5 text-sm font-medium whitespace-nowrap">
        {task.name}
      </td>
      {sortedColumns.map((col) => {
        const cell = cellMap.get(col.role.id)?.get(task.id)
        const value = (cell?.currentValue ?? '—') as Parameters<typeof RasciCell>[0]['currentValue']
        return (
          <RasciCell
            key={`${col.role.id}-${task.id}`}
            roleId={col.role.id}
            taskId={task.id}
            roleName={col.role.name}
            taskName={task.name}
            currentValue={value}
            isOverridden={cell?.isOverridden ?? false}
            templateValue={
              (cell?.templateValue ?? null) as Parameters<typeof RasciCell>[0]['templateValue']
            }
            canEdit={canEdit}
            taskResources={task.resources}
          />
        )
      })}
    </tr>
  )
}
