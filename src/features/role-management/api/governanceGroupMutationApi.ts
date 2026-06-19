import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── Shared role group response schema ───────────────────────────────────────

const roleGroupResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  color: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
})

// ─── CreateRoleGroup ──────────────────────────────────────────────────────────

const CREATE_ROLE_GROUP_MUTATION = /* GraphQL */ `
  mutation CreateRoleGroup($input: CreateRoleGroupInput!) {
    createRoleGroup(input: $input) {
      id
      name
      description
      sortOrder
      color
    }
  }
`

const createRoleGroupResponseSchema = z.object({
  createRoleGroup: roleGroupResponseSchema,
})

/** Input type for the createRoleGroup mutation. */
export interface CreateRoleGroupInput {
  name: string
  description?: string
  sortOrder: number
  color?: string
}

/**
 * Sends the `CreateRoleGroup` GraphQL mutation.
 * @param input - Role group creation input.
 * @returns The created role group.
 */
export async function createRoleGroup(input: CreateRoleGroupInput) {
  const raw = await graphqlClient.request(CREATE_ROLE_GROUP_MUTATION, { input })
  const parsed = createRoleGroupResponseSchema.parse(raw)
  return parsed.createRoleGroup
}

// ─── EditRoleGroup ────────────────────────────────────────────────────────────

const EDIT_ROLE_GROUP_MUTATION = /* GraphQL */ `
  mutation EditRoleGroup($input: EditRoleGroupInput!) {
    editRoleGroup(input: $input) {
      id
      name
      description
      sortOrder
      color
    }
  }
`

const editRoleGroupResponseSchema = z.object({
  editRoleGroup: roleGroupResponseSchema,
})

/** Input type for the editRoleGroup mutation. */
export interface EditRoleGroupInput {
  id: string
  name?: string
  description?: string
  sortOrder?: number
  color?: string
}

/**
 * Sends the `EditRoleGroup` GraphQL mutation.
 * @param input - Role group edit input.
 * @returns The updated role group.
 */
export async function editRoleGroup(input: EditRoleGroupInput) {
  const raw = await graphqlClient.request(EDIT_ROLE_GROUP_MUTATION, { input })
  const parsed = editRoleGroupResponseSchema.parse(raw)
  return parsed.editRoleGroup
}

// ─── DeleteRoleGroup ──────────────────────────────────────────────────────────

const DELETE_ROLE_GROUP_MUTATION = /* GraphQL */ `
  mutation DeleteRoleGroup($id: ID!) {
    deleteRoleGroup(id: $id) {
      success
      id
    }
  }
`

const deleteRoleGroupResponseSchema = z.object({
  deleteRoleGroup: z.object({
    success: z.boolean(),
    id: z.string(),
  }),
})

/**
 * Sends the `DeleteRoleGroup` GraphQL mutation.
 * @param id - The role group ID to delete.
 * @returns The delete result with success flag and id.
 */
export async function deleteRoleGroup(id: string) {
  const raw = await graphqlClient.request(DELETE_ROLE_GROUP_MUTATION, { id })
  const parsed = deleteRoleGroupResponseSchema.parse(raw)
  return parsed.deleteRoleGroup
}
