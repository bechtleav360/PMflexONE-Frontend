import { graphql, HttpResponse } from 'msw'

import type { MatrixRole } from '@/entities/role'

import { findOrCreateObjectMatrix, nextCustomRoleId, templateRoles } from './seed'

/** MSW handler for the `ChangeObjectRolePermission` mutation. */
export const changeObjectRolePermissionHandler = graphql.mutation(
  'ChangeObjectRolePermission',
  ({ variables }) => {
    const { input } = variables as {
      input: { objectId: string; roleId: string; taskId: string; permissionKey: string }
    }
    const matrix = findOrCreateObjectMatrix(input.objectId)
    const role = matrix.roles.find((r) => r.id === input.roleId)
    if (!role) {
      return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
    }
    const task = role.tasks.find((t) => t.taskId === input.taskId)
    if (task) {
      task.permissionKey = input.permissionKey
    } else {
      role.tasks.push({ taskId: input.taskId, permissionKey: input.permissionKey })
    }
    return HttpResponse.json({
      data: { changeObjectRolePermission: { id: role.id, tasks: role.tasks } },
    })
  },
)

/** MSW handler for the `ResetTaskPermission` mutation. */
export const resetTaskPermissionHandler = graphql.mutation(
  'ResetTaskPermission',
  ({ variables }) => {
    const { input } = variables as {
      input: { objectId: string; roleId: string; taskId: string }
    }
    const matrix = findOrCreateObjectMatrix(input.objectId)
    const role = matrix.roles.find((r) => r.id === input.roleId)
    if (!role) {
      return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
    }
    const templateRole = templateRoles.find((r) => r.id === input.roleId)
    const templateTask = templateRole?.tasks.find((t) => t.taskId === input.taskId)
    const task = role.tasks.find((t) => t.taskId === input.taskId)
    if (task && templateTask) {
      task.permissionKey = templateTask.permissionKey
    }
    return HttpResponse.json({
      data: { resetTaskPermission: { id: role.id, tasks: role.tasks } },
    })
  },
)

/** MSW handler for the `ResetRolePermissions` mutation. */
export const resetRolePermissionsHandler = graphql.mutation(
  'ResetRolePermissions',
  ({ variables }) => {
    const { input } = variables as { input: { objectId: string; roleId: string } }
    const matrix = findOrCreateObjectMatrix(input.objectId)
    const role = matrix.roles.find((r) => r.id === input.roleId)
    if (!role) {
      return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
    }
    const templateRole = templateRoles.find((r) => r.id === input.roleId)
    if (templateRole) {
      role.tasks = templateRole.tasks.map((t) => ({ ...t }))
    }
    return HttpResponse.json({
      data: { resetRolePermissions: { id: role.id, tasks: role.tasks } },
    })
  },
)

/** MSW handler for the `AddRoleToObjectMatrix` mutation. */
export const addRoleToObjectMatrixHandler = graphql.mutation(
  'AddRoleToObjectMatrix',
  ({ variables }) => {
    const { input } = variables as {
      input: {
        objectId: string
        name: string
        shortTitle: string
        description?: string
        groupId: string
        tasks: Array<{ taskId: string; permissionKey: string }>
      }
    }
    const matrix = findOrCreateObjectMatrix(input.objectId)
    const newRole: MatrixRole = {
      id: nextCustomRoleId(),
      name: input.name,
      shortTitle: input.shortTitle,
      description: input.description ?? null,
      isFixed: false,
      isDefault: false,
      groupId: input.groupId,
      tasks: input.tasks,
    }
    matrix.roles.push(newRole)
    return HttpResponse.json({ data: { addRoleToObjectMatrix: newRole } })
  },
)

/** MSW handler for the `DeleteObjectRole` mutation. */
export const deleteObjectRoleHandler = graphql.mutation('DeleteObjectRole', ({ variables }) => {
  const { id, objectId } = variables as { id: string; objectId: string }
  const matrix = findOrCreateObjectMatrix(objectId)
  const idx = matrix.roles.findIndex((r) => r.id === id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
  }
  matrix.roles.splice(idx, 1)
  return HttpResponse.json({ data: { deleteObjectRole: { success: true, id } } })
})

/** MSW handler for the `EditObjectRole` mutation. */
export const editObjectRoleHandler = graphql.mutation('EditObjectRole', ({ variables }) => {
  const { input } = variables as {
    input: {
      id: string
      objectId: string
      name?: string
      shortTitle?: string
      description?: string
      groupId?: string
      tasks: Array<{ taskId: string; permissionKey: string }>
    }
  }
  const matrix = findOrCreateObjectMatrix(input.objectId)
  const role = matrix.roles.find((r) => r.id === input.id)
  if (!role) {
    return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
  }
  if (input.name !== undefined) role.name = input.name
  if (input.shortTitle !== undefined) role.shortTitle = input.shortTitle
  if (input.description !== undefined) role.description = input.description
  if (input.groupId !== undefined) role.groupId = input.groupId
  role.tasks = input.tasks
  return HttpResponse.json({ data: { editObjectRole: role } })
})
