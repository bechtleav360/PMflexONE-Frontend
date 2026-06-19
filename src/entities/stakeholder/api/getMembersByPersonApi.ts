import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { ProjectMember } from '../types/stakeholder.types'

/** GraphQL document for the `MembersByPerson` query. */
export const QUERY = /* GraphQL */ `
  query MembersByPerson($objectId: ID!) {
    membersByPerson(objectId: $objectId) {
      person {
        id
        firstName
        lastName
        mail
      }
      roleAssignments {
        role {
          name
        }
      }
    }
  }
`

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string().nullable(),
})

const responseSchema = z.object({
  membersByPerson: z.array(
    z.object({
      person: personSchema,
      roleAssignments: z.array(z.object({ role: z.object({ name: z.string() }) })),
    }),
  ),
})

/**
 * Returns the distinct persons assigned to a domain object (Portfolio / Program / Project),
 * each carrying the deduped RASCI role name(s) they hold on that object.
 * Backed by the `membersByPerson` aggregate query.
 *
 * @param objectId - The ID of the domain object to query members for.
 * @returns An array of {@link ProjectMember} objects with deduped role names.
 */
export async function getMembersByPerson(objectId: string): Promise<ProjectMember[]> {
  const raw = await graphqlClient.request(QUERY, { objectId })
  const parsed = responseSchema.parse(raw)
  return parsed.membersByPerson.map((m) => ({
    ...m.person,
    roleNames: [...new Set(m.roleAssignments.map((a) => a.role.name))],
  }))
}
