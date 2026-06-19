import { useMemo } from 'react'

import type { MatrixTask, ResolvedMatrixColumn, RoleGroup, TaskGroup } from '@/entities/role'

type CellData = { currentValue: string; isOverridden: boolean; templateValue: string | null }

interface SortedMatrixData {
  orderedRoleGroups: RoleGroup[]
  groupPaletteIndex: Map<string, number>
  sortedColumns: ResolvedMatrixColumn[]
  cellMap: Map<string, Map<string, CellData>>
  tasksByGroup: Map<string | null, MatrixTask[]>
  orderedTaskGroups: TaskGroup[]
}

/**
 * Derives all sorted/grouped data structures needed to render the RASCI matrix table.
 * Memoizes every derived value to avoid recomputation on unrelated renders.
 *
 * @param columns - Resolved matrix columns (one per role).
 * @param tasks - All tasks in the matrix.
 * @param taskGroups - Task groups for row grouping.
 * @param roleGroups - Role groups for column grouping.
 * @returns Sorted columns, cell map, task groupings, and ordered group lists.
 */
export function useSortedMatrixData(
  columns: ResolvedMatrixColumn[],
  tasks: MatrixTask[],
  taskGroups: TaskGroup[],
  roleGroups: RoleGroup[],
): SortedMatrixData {
  const orderedRoleGroups = useMemo(() => {
    const activeRoleGroupIds = new Set(
      columns.filter((c) => c.group !== null).map((c) => c.group!.id),
    )
    return roleGroups
      .filter((g) => activeRoleGroupIds.has(g.id))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [columns, roleGroups])

  const groupPaletteIndex = useMemo(
    () => new Map<string, number>(orderedRoleGroups.map((g, i) => [g.id, i])),
    [orderedRoleGroups],
  )

  const sortedColumns = useMemo(
    () =>
      [...columns].sort((a, b) => {
        const orderA = a.group?.sortOrder ?? Infinity
        const orderB = b.group?.sortOrder ?? Infinity
        if (orderA !== orderB) return orderA - orderB
        return a.role.shortTitle.localeCompare(b.role.shortTitle)
      }),
    [columns],
  )

  const cellMap = useMemo(() => {
    const map = new Map<string, Map<string, CellData>>()
    for (const col of sortedColumns) {
      const colMap = new Map<string, CellData>()
      for (const cell of col.cells) {
        colMap.set(cell.taskId, {
          currentValue: cell.currentValue,
          isOverridden: cell.isOverridden,
          templateValue: cell.templateValue,
        })
      }
      map.set(col.role.id, colMap)
    }
    return map
  }, [sortedColumns])

  const tasksByGroup = useMemo(() => {
    const map = new Map<string | null, MatrixTask[]>()
    for (const task of tasks) {
      const gid = task.groupId
      if (!map.has(gid)) map.set(gid, [])
      map.get(gid)!.push(task)
    }
    return map
  }, [tasks])

  const orderedTaskGroups = useMemo(
    () => taskGroups.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [taskGroups],
  )

  return {
    orderedRoleGroups,
    groupPaletteIndex,
    sortedColumns,
    cellMap,
    tasksByGroup,
    orderedTaskGroups,
  }
}
