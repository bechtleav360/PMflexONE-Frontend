import type {
  MatrixDetail,
  ResolvedCell,
  ResolvedMatrixColumn,
  RoleGroup,
} from '../model/role.types'

/**
 * Derives ResolvedMatrixColumn[] by comparing object matrix against template matrix.
 * isCustomRole is determined by ID-based lookup only — name matching is not used.
 * @param objectMatrix - The object-level matrix with current permission values.
 * @param templateMatrix - The template matrix used as the source of truth for overrides.
 * @param roleGroups - All role groups for resolving group metadata per column.
 * @returns Array of resolved columns with override and custom-role flags set.
 */
export function resolveMatrix(
  objectMatrix: MatrixDetail,
  templateMatrix: MatrixDetail,
  roleGroups: RoleGroup[],
): ResolvedMatrixColumn[] {
  const templateRoleIds = new Set(templateMatrix.roles.map((r) => r.id))
  const templateTaskMap = new Map(
    templateMatrix.roles.flatMap((r) =>
      r.tasks.map((t) => [`${r.id}:${t.taskId}`, t.permissionKey]),
    ),
  )
  const roleGroupMap = new Map(roleGroups.map((g) => [g.id, g]))

  return objectMatrix.roles.map((role) => {
    const isCustomRole = !templateRoleIds.has(role.id)

    const cells: ResolvedCell[] = role.tasks.map((task) => {
      const templateValue = isCustomRole
        ? null
        : (templateTaskMap.get(`${role.id}:${task.taskId}`) ?? null)
      const isOverridden =
        !isCustomRole && (templateValue === null || task.permissionKey !== templateValue)

      return {
        roleId: role.id,
        taskId: task.taskId,
        currentValue: task.permissionKey,
        templateValue,
        isOverridden,
      }
    })

    return {
      role,
      group: roleGroupMap.get(role.groupId) ?? null,
      cells,
      hasAnyOverride: cells.some((c) => c.isOverridden),
      isCustomRole,
    }
  })
}
