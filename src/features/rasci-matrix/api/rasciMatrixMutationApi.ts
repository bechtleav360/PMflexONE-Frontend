import { z } from 'zod'

import { roleTaskPermissionSchema } from '@/entities/role'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── Shared role fragment schema ─────────────────────────────────────────────

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

// ─── Shared response schema ──────────────────────────────────────────────────

const matrixMutationResponseSchema = z.object({
  id: z.string(),
  tasks: z.array(roleTaskPermissionSchema),
})

// ─── ChangeObjectRolePermission ──────────────────────────────────────────────

const CHANGE_OBJECT_ROLE_PERMISSION_MUTATION = /* GraphQL */ `
  mutation ChangeObjectRolePermission($input: ChangePermissionInput!) {
    changeObjectRolePermission(input: $input) {
      id
      tasks {
        taskId
        permissionKey
      }
    }
  }
`

const changeObjectRolePermissionResponseSchema = z.object({
  changeObjectRolePermission: matrixMutationResponseSchema,
})

/** Input type for the changeObjectRolePermission mutation. */
export interface ChangeObjectRolePermissionInput {
  objectId: string
  roleId: string
  taskId: string
  permissionKey: string
}

/**
 * Sends the `ChangeObjectRolePermission` GraphQL mutation.
 * @param input - Permission change input.
 * @returns The updated matrix fragment (id + tasks).
 */
export async function changeObjectRolePermission(input: ChangeObjectRolePermissionInput) {
  const raw = await graphqlClient.request(CHANGE_OBJECT_ROLE_PERMISSION_MUTATION, { input })
  const parsed = changeObjectRolePermissionResponseSchema.parse(raw)
  return parsed.changeObjectRolePermission
}

// ─── ResetTaskPermission ─────────────────────────────────────────────────────

const RESET_TASK_PERMISSION_MUTATION = /* GraphQL */ `
  mutation ResetTaskPermission($input: ResetTaskPermissionInput!) {
    resetTaskPermission(input: $input) {
      id
      tasks {
        taskId
        permissionKey
      }
    }
  }
`

const resetTaskPermissionResponseSchema = z.object({
  resetTaskPermission: matrixMutationResponseSchema,
})

/** Input type for the resetTaskPermission mutation. */
export interface ResetTaskPermissionInput {
  objectId: string
  roleId: string
  taskId: string
}

/**
 * Sends the `ResetTaskPermission` GraphQL mutation.
 * @param input - Task permission reset input.
 * @returns The updated matrix fragment (id + tasks).
 */
export async function resetTaskPermission(input: ResetTaskPermissionInput) {
  const raw = await graphqlClient.request(RESET_TASK_PERMISSION_MUTATION, { input })
  const parsed = resetTaskPermissionResponseSchema.parse(raw)
  return parsed.resetTaskPermission
}

// ─── ResetRolePermissions ────────────────────────────────────────────────────

const RESET_ROLE_PERMISSIONS_MUTATION = /* GraphQL */ `
  mutation ResetRolePermissions($input: ResetRolePermissionsInput!) {
    resetRolePermissions(input: $input) {
      id
      tasks {
        taskId
        permissionKey
      }
    }
  }
`

const resetRolePermissionsResponseSchema = z.object({
  resetRolePermissions: matrixMutationResponseSchema,
})

/** Input type for the resetRolePermissions mutation. */
export interface ResetRolePermissionsInput {
  objectId: string
  roleId: string
}

/**
 * Sends the `ResetRolePermissions` GraphQL mutation.
 * @param input - Role permissions reset input.
 * @returns The updated matrix fragment (id + tasks).
 */
export async function resetRolePermissions(input: ResetRolePermissionsInput) {
  const raw = await graphqlClient.request(RESET_ROLE_PERMISSIONS_MUTATION, { input })
  const parsed = resetRolePermissionsResponseSchema.parse(raw)
  return parsed.resetRolePermissions
}

// ─── AddRoleToObjectMatrix ───────────────────────────────────────────────────

const ADD_ROLE_TO_OBJECT_MATRIX_MUTATION = /* GraphQL */ `
  mutation AddRoleToObjectMatrix($input: AddObjectRoleInput!) {
    addRoleToObjectMatrix(input: $input) {
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

const addRoleToObjectMatrixResponseSchema = z.object({
  addRoleToObjectMatrix: matrixRoleResponseSchema,
})

/** Input type for the addRoleToObjectMatrix mutation. */
export interface AddObjectRoleInput {
  objectId: string
  name: string
  shortTitle: string
  description?: string
  groupId: string
  tasks: Array<{ taskId: string; permissionKey: string }>
}

/**
 * Sends the `AddRoleToObjectMatrix` GraphQL mutation.
 * @param input - Object role creation input.
 * @returns The created role.
 */
export async function addRoleToObjectMatrix(input: AddObjectRoleInput) {
  const raw = await graphqlClient.request(ADD_ROLE_TO_OBJECT_MATRIX_MUTATION, { input })
  const parsed = addRoleToObjectMatrixResponseSchema.parse(raw)
  return parsed.addRoleToObjectMatrix
}

// ─── DeleteObjectRole ────────────────────────────────────────────────────────

const DELETE_OBJECT_ROLE_MUTATION = /* GraphQL */ `
  mutation DeleteObjectRole($id: ID!, $objectId: ID!) {
    deleteObjectRole(id: $id, objectId: $objectId) {
      success
      id
    }
  }
`

const deleteObjectRoleResponseSchema = z.object({
  deleteObjectRole: z.object({
    success: z.boolean(),
    id: z.string(),
  }),
})

/** Input type for the deleteObjectRole mutation. */
export interface DeleteObjectRoleInput {
  id: string
  objectId: string
}

/**
 * Sends the `DeleteObjectRole` GraphQL mutation.
 * @param input - Object role deletion input.
 * @returns The delete result with success flag and id.
 */
export async function deleteObjectRole(input: DeleteObjectRoleInput) {
  const raw = await graphqlClient.request(DELETE_OBJECT_ROLE_MUTATION, {
    id: input.id,
    objectId: input.objectId,
  })
  const parsed = deleteObjectRoleResponseSchema.parse(raw)
  return parsed.deleteObjectRole
}

// ─── EditObjectRole ──────────────────────────────────────────────────────────

const EDIT_OBJECT_ROLE_MUTATION = /* GraphQL */ `
  mutation EditObjectRole($input: EditObjectRoleInput!) {
    editObjectRole(input: $input) {
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

const editObjectRoleResponseSchema = z.object({
  editObjectRole: matrixRoleResponseSchema,
})

/** Input type for the editObjectRole mutation. */
export interface EditObjectRoleInput {
  id: string
  objectId: string
  name?: string
  shortTitle?: string
  description?: string
  groupId?: string
  tasks: Array<{ taskId: string; permissionKey: string }>
}

/**
 * Sends the `EditObjectRole` GraphQL mutation.
 * @param input - Object role edit input.
 * @returns The updated role.
 */
export async function editObjectRole(input: EditObjectRoleInput) {
  const raw = await graphqlClient.request(EDIT_OBJECT_ROLE_MUTATION, { input })
  const parsed = editObjectRoleResponseSchema.parse(raw)
  return parsed.editObjectRole
}
