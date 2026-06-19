import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { memberAssignmentSchema } from '../model/projectMember.schema'
import type { MemberAssignment } from '../model/projectMember.types'

const MEMBER_ASSIGNMENT_FIELDS = /* GraphQL */ `
  id
  person { id firstName lastName mail }
  role { id name shortTitle }
  initials
`

const CREATE_MUTATION = /* GraphQL */ `
  mutation CreateMemberAssignment($input: AddMemberAssignmentInput!) {
    createMemberAssignment(input: $input) {
      ${MEMBER_ASSIGNMENT_FIELDS}
    }
  }
`

const UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateMemberAssignment($input: UpdateMemberAssignmentInput!) {
    updateMemberAssignment(input: $input) {
      ${MEMBER_ASSIGNMENT_FIELDS}
    }
  }
`

const DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteMemberAssignment($id: ID!) {
    deleteMemberAssignment(id: $id)
  }
`

const createResultSchema = z.object({
  createMemberAssignment: memberAssignmentSchema,
})

const updateResultSchema = z.object({
  updateMemberAssignment: memberAssignmentSchema,
})

/**
 * Input for creating a new member assignment on a scope object.
 */
export interface CreateMemberAssignmentInput {
  scopeId: string
  scopeType: 'Project' | 'Program' | 'Portfolio'
  personId: string
  roleId: string
  initials?: string
}

/**
 * Input for updating an existing member assignment's role or initials.
 */
export interface UpdateMemberAssignmentInput {
  id: string
  roleId?: string
  initials?: string
}

/**
 * Creates a new member assignment via the GraphQL mutation.
 *
 * @param input - Scope, person, role, and optional initials for the new assignment.
 * @returns The created MemberAssignment record.
 */
export async function createMemberAssignment(
  input: CreateMemberAssignmentInput,
): Promise<MemberAssignment> {
  const raw = await graphqlClient.request(CREATE_MUTATION, { input })
  return createResultSchema.parse(raw).createMemberAssignment
}

/**
 * Updates an existing member assignment's role and/or initials via the GraphQL mutation.
 *
 * @param input - The assignment ID plus the fields to update.
 * @returns The updated MemberAssignment record.
 */
export async function updateMemberAssignment(
  input: UpdateMemberAssignmentInput,
): Promise<MemberAssignment> {
  const raw = await graphqlClient.request(UPDATE_MUTATION, { input })
  return updateResultSchema.parse(raw).updateMemberAssignment
}

/**
 * Deletes a member assignment by ID via the GraphQL mutation.
 *
 * @param id - The ID of the assignment to delete.
 */
export async function deleteMemberAssignment(id: string): Promise<void> {
  await graphqlClient.request(DELETE_MUTATION, { id })
}
