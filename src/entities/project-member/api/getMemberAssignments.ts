import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { memberAssignmentSchema } from '../model/projectMember.schema'
import type { MemberAssignment } from '../model/projectMember.types'

const QUERY = /* GraphQL */ `
  query GetMemberAssignments($objectId: ID!) {
    memberAssignments(objectId: $objectId) {
      id
      person {
        id
        firstName
        lastName
        mail
      }
      role {
        id
        name
        shortTitle
      }
      initials
    }
  }
`

const responseSchema = z.object({
  memberAssignments: z.array(memberAssignmentSchema),
})

/**
 * Fetches all member assignments for the given object from the GraphQL API.
 *
 * @param objectId - The ID of the scope object (project, program, or portfolio).
 * @returns Array of MemberAssignment records.
 */
export async function getMemberAssignments(objectId: string): Promise<MemberAssignment[]> {
  const raw = await graphqlClient.request(QUERY, { objectId })
  const parsed = responseSchema.parse(raw)
  return parsed.memberAssignments
}
