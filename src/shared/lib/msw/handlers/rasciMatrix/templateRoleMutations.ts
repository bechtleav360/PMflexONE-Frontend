import { graphql, HttpResponse } from 'msw'

import type { MatrixRole } from '@/entities/role'

import { namedMatrices, nextRoleId, objectMatrices, templateMatrix } from './seed'

/** MSW handler for the `AddRoleToMatrix` mutation. */
export const addRoleToMatrixHandler = graphql.mutation('AddRoleToMatrix', ({ variables }) => {
  const { input } = variables as {
    input: {
      matrixId: string
      name: string
      shortTitle: string
      description?: string
      groupId: string
      tasks: Array<{ taskId: string; permissionKey: string }>
    }
  }
  const matrix = namedMatrices[input.matrixId] ?? templateMatrix
  const newRole: MatrixRole = {
    id: nextRoleId(),
    name: input.name,
    shortTitle: input.shortTitle,
    description: input.description ?? null,
    isFixed: false,
    isDefault: false,
    groupId: input.groupId,
    tasks: input.tasks,
  }
  matrix.roles.push(newRole)
  return HttpResponse.json({ data: { addRoleToMatrix: newRole } })
})

/** MSW handler for the `EditRole` mutation. */
export const editRoleHandler = graphql.mutation('EditRole', ({ variables }) => {
  const { input } = variables as {
    input: {
      id: string
      name?: string
      shortTitle?: string
      description?: string
      groupId?: string
      tasks: Array<{ taskId: string; permissionKey: string }>
    }
  }
  const allMatrices = [...Object.values(namedMatrices), ...Object.values(objectMatrices)]
  for (const matrix of allMatrices) {
    const role = matrix.roles.find((r) => r.id === input.id)
    if (role) {
      if (input.name !== undefined) role.name = input.name
      if (input.shortTitle !== undefined) role.shortTitle = input.shortTitle
      if (input.description !== undefined) role.description = input.description
      if (input.groupId !== undefined) role.groupId = input.groupId
      role.tasks = input.tasks
      return HttpResponse.json({ data: { editRole: role } })
    }
  }
  return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
})

/** MSW handler for the `DeleteRole` mutation. */
export const deleteRoleHandler = graphql.mutation('DeleteRole', ({ variables }) => {
  const { id } = variables as { id: string }
  const allMatrices = [...Object.values(namedMatrices), ...Object.values(objectMatrices)]
  for (const matrix of allMatrices) {
    const idx = matrix.roles.findIndex((r) => r.id === id)
    if (idx !== -1) {
      matrix.roles.splice(idx, 1)
      return HttpResponse.json({ data: { deleteRole: { success: true, id } } })
    }
  }
  return HttpResponse.json({ errors: [{ message: 'Role not found' }] }, { status: 200 })
})
