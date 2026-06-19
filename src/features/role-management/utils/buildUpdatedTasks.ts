import type { MatrixTask } from '@/entities/role'

interface RoleTask {
  taskId: string
  permissionKey: string
}

/**
 * Reconstructs the full tasks array for a role after a single cell value change.
 *
 * Builds from all matrix tasks so tasks absent from `roleTasks` (value '—') can be added.
 * Filters out '—' before returning — the backend does not accept that key.
 *
 * @param allTasks - All tasks defined in the matrix.
 * @param roleTasks - Current tasks assigned to the role.
 * @param changedTaskId - The task ID whose value is being changed.
 * @param newValue - The new permission key value to apply to the changed task.
 * @returns Updated tasks array with '—' values removed.
 */
export function buildUpdatedTasks(
  allTasks: MatrixTask[],
  roleTasks: RoleTask[],
  changedTaskId: string,
  newValue: string,
): RoleTask[] {
  return allTasks
    .map((task) => {
      const existing = roleTasks.find((t) => t.taskId === task.id)
      const permissionKey = task.id === changedTaskId ? newValue : (existing?.permissionKey ?? '—')
      return { taskId: task.id, permissionKey }
    })
    .filter((t) => t.permissionKey !== '—')
}
