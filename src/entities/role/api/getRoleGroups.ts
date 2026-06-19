import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { roleGroupSchema } from '../model/role.schema'
import type { RoleGroup } from '../model/role.types'

const QUERY = /* GraphQL */ `
  query GetRoleGroups {
    roleGroups {
      id
      name
      description
      sortOrder
      color
    }
  }
`

const responseSchema = z.object({
  roleGroups: z.array(roleGroupSchema),
})

/**
 * Fetches all role groups from the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @returns A promise resolving to the array of role groups.
 */
export async function getRoleGroups(): Promise<RoleGroup[]> {
  const raw = await graphqlClient.request(QUERY)
  const parsed = responseSchema.parse(raw)
  return parsed.roleGroups
}
