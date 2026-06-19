import { z } from 'zod'

import { roleTaskPermissionSchema } from '@/entities/role'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── Shared role fragment schema ────────────────────────────────────────────

const matrixRoleResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortTitle: z.string(),
  description: z.string().nullable(),
  isFixed: z.boolean(),
  isDefault: z.boolean(),
  groupId: z.string(),
  tasks: z.array(roleTaskPermissionSchema),
})

// ─── AddRoleToMatrix ─────────────────────────────────────────────────────────

const ADD_ROLE_MUTATION = /* GraphQL */ `
  mutation AddRoleToMatrix($input: AddRoleInput!) {
    addRoleToMatrix(input: $input) {
      id
      name
      shortTitle
      description
      isFixed
      isDefault
      groupId
      tasks {
        taskId
        permissionKey
      }
    }
  }
`

const addRoleResponseSchema = z.object({
  addRoleToMatrix: matrixRoleResponseSchema,
})

/** Input type for the addRoleToMatrix mutation. */
export interface AddRoleInput {
  matrixId: string
  name: string
  shortTitle: string
  description?: string
  groupId: string
  tasks: Array<{ taskId: string; permissionKey: string }>
}

/**
 * Sends the `AddRoleToMatrix` GraphQL mutation.
 * @param input - Role creation input.
 * @returns The created role.
 */
export async function addRoleToMatrix(input: AddRoleInput) {
  const raw = await graphqlClient.request(ADD_ROLE_MUTATION, { input })
  const parsed = addRoleResponseSchema.parse(raw)
  return parsed.addRoleToMatrix
}

// ─── EditRole ────────────────────────────────────────────────────────────────

const EDIT_ROLE_MUTATION = /* GraphQL */ `
  mutation EditRole($input: EditRoleInput!) {
    editRole(input: $input) {
      id
      name
      shortTitle
      description
      isFixed
      isDefault
      groupId
      tasks {
        taskId
        permissionKey
      }
    }
  }
`

const editRoleResponseSchema = z.object({
  editRole: matrixRoleResponseSchema,
})

/** Input type for the editRole mutation (id + all AddRoleInput fields except matrixId). */
export interface EditRoleInput {
  id: string
  name?: string
  shortTitle?: string
  description?: string
  groupId?: string
  tasks: Array<{ taskId: string; permissionKey: string }>
}

/**
 * Sends the `EditRole` GraphQL mutation.
 * @param input - Role edit input.
 * @returns The updated role.
 */
export async function editRole(input: EditRoleInput) {
  const raw = await graphqlClient.request(EDIT_ROLE_MUTATION, { input })
  const parsed = editRoleResponseSchema.parse(raw)
  return parsed.editRole
}

// ─── DeleteRole ──────────────────────────────────────────────────────────────

const DELETE_ROLE_MUTATION = /* GraphQL */ `
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id) {
      success
      id
    }
  }
`

const deleteRoleResponseSchema = z.object({
  deleteRole: z.object({
    success: z.boolean(),
    id: z.string(),
  }),
})

/**
 * Sends the `DeleteRole` GraphQL mutation.
 * @param id - The role ID to delete.
 * @returns The delete result with success flag and id.
 */
export async function deleteRole(id: string) {
  const raw = await graphqlClient.request(DELETE_ROLE_MUTATION, { id })
  const parsed = deleteRoleResponseSchema.parse(raw)
  return parsed.deleteRole
}
