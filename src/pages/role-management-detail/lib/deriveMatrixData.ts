import type { MatrixRole, MatrixTask, RoleGroup, TaskGroup } from '@/entities/role'

/**
 * Returns true when any of the given pending flags is true.
 *
 * @param flags - Array of isPending booleans from TanStack Query hooks.
 * @returns True if at least one request is still in flight.
 */
export function anyPending(...flags: boolean[]): boolean {
  return flags.some(Boolean)
}

/**
 * Returns roles sorted by their group's sortOrder, then by shortTitle.
 *
 * @param roles - Raw roles from the matrix detail.
 * @param roleGroupMap - Map of groupId to RoleGroup for sort order lookup.
 * @returns Sorted roles array.
 */
export function sortRoles(roles: MatrixRole[], roleGroupMap: Map<string, RoleGroup>): MatrixRole[] {
  return [...roles].sort((a, b) => {
    const groupA = roleGroupMap.get(a.groupId)
    const groupB = roleGroupMap.get(b.groupId)
    const orderA = groupA?.sortOrder ?? 0
    const orderB = groupB?.sortOrder ?? 0
    if (orderA !== orderB) return orderA - orderB
    return a.shortTitle.localeCompare(b.shortTitle)
  })
}

/**
 * Derives the ordered list of group IDs based on the order roles appear.
 *
 * @param roles - Sorted roles array.
 * @returns Unique group IDs in encounter order.
 */
export function deriveOrderedGroupIds(roles: MatrixRole[]): string[] {
  const ids: string[] = []
  for (const role of roles) {
    if (!ids.includes(role.groupId)) ids.push(role.groupId)
  }
  return ids
}

interface GroupedTasks {
  tasksByGroup: Map<string | null, MatrixTask[]>
  ungroupedTasks: MatrixTask[]
  orderedTaskGroupIds: (string | null)[]
}

/**
 * Groups tasks by their groupId, separating ungrouped tasks, and derives the ordered group ID list.
 *
 * @param tasks - All tasks from the matrix.
 * @returns Object with tasksByGroup map, ungroupedTasks array, and orderedTaskGroupIds.
 */
export function groupTasks(tasks: MatrixTask[]): GroupedTasks {
  const tasksByGroup = new Map<string | null, MatrixTask[]>()
  const ungroupedTasks: MatrixTask[] = []
  const orderedTaskGroupIds: (string | null)[] = []

  for (const task of tasks) {
    if (task.groupId === null) {
      ungroupedTasks.push(task)
    } else {
      const existing = tasksByGroup.get(task.groupId) ?? []
      tasksByGroup.set(task.groupId, [...existing, task])
    }
    if (!orderedTaskGroupIds.includes(task.groupId)) {
      orderedTaskGroupIds.push(task.groupId)
    }
  }

  return { tasksByGroup, ungroupedTasks, orderedTaskGroupIds }
}

/**
 * Builds a Map from group ID to TaskGroup.
 *
 * @param taskGroups - All task groups.
 * @returns Map of id to TaskGroup.
 */
export function buildTaskGroupMap(taskGroups: TaskGroup[]): Map<string, TaskGroup> {
  return new Map(taskGroups.map((g) => [g.id, g]))
}

/**
 * Builds a Map from group ID to RoleGroup.
 *
 * @param roleGroups - All role groups.
 * @returns Map of id to RoleGroup.
 */
export function buildRoleGroupMap(roleGroups: RoleGroup[]): Map<string, RoleGroup> {
  return new Map(roleGroups.map((g) => [g.id, g]))
}

interface MatrixDetailData {
  roles: MatrixRole[]
  tasks: MatrixTask[]
}

/**
 * Safely extracts roles and tasks from an optional matrix detail object.
 * Returns empty arrays when the detail is undefined.
 *
 * @param matrixDetail - The optional matrix detail, as returned by the query.
 * @returns An object with `roles` and `tasks` arrays (never undefined).
 */
export function extractMatrixData(
  matrixDetail: { roles: MatrixRole[]; tasks: MatrixTask[] } | undefined,
): MatrixDetailData {
  return {
    roles: matrixDetail?.roles ?? [],
    tasks: matrixDetail?.tasks ?? [],
  }
}
