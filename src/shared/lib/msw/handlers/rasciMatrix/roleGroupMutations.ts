import { graphql, HttpResponse } from 'msw'

import type { RoleGroup } from '@/entities/role'

import { nextRoleGroupId, roleGroups } from './seed'

/** MSW handler for the `CreateRoleGroup` mutation. */
export const createRoleGroupHandler = graphql.mutation('CreateRoleGroup', ({ variables }) => {
  const { input } = variables as {
    input: { name: string; description?: string; sortOrder: number; color?: string }
  }
  const newGroup: RoleGroup = {
    id: nextRoleGroupId(),
    name: input.name,
    description: input.description ?? null,
    sortOrder: input.sortOrder,
    color: input.color ?? null,
  }
  roleGroups.push(newGroup)
  return HttpResponse.json({ data: { createRoleGroup: newGroup } })
})

/** MSW handler for the `EditRoleGroup` mutation. */
export const editRoleGroupHandler = graphql.mutation('EditRoleGroup', ({ variables }) => {
  const { input } = variables as {
    input: { id: string; name?: string; description?: string; sortOrder?: number; color?: string }
  }
  const group = roleGroups.find((g) => g.id === input.id)
  if (!group) {
    return HttpResponse.json({ errors: [{ message: 'RoleGroup not found' }] }, { status: 200 })
  }
  if (input.name !== undefined) group.name = input.name
  if (input.description !== undefined) group.description = input.description
  if (input.sortOrder !== undefined) group.sortOrder = input.sortOrder
  if (input.color !== undefined) group.color = input.color
  return HttpResponse.json({ data: { editRoleGroup: group } })
})

/** MSW handler for the `DeleteRoleGroup` mutation. */
export const deleteRoleGroupHandler = graphql.mutation('DeleteRoleGroup', ({ variables }) => {
  const { id } = variables as { id: string }
  const idx = roleGroups.findIndex((g) => g.id === id)
  if (idx === -1) {
    return HttpResponse.json({ errors: [{ message: 'RoleGroup not found' }] }, { status: 200 })
  }
  roleGroups.splice(idx, 1)
  return HttpResponse.json({ data: { deleteRoleGroup: { success: true, id } } })
})
