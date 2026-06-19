import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { resourcePermissionSchema } from '../model/role.schema'
import type { ResourcePermission } from '../model/role.types'

const QUERY = /* GraphQL */ `
  query GetUserPermissions($resources: [String!]!, $objectId: ID) {
    userPermissions(resources: $resources, objectId: $objectId) {
      resource
      operations
    }
  }
`

const responseSchema = z.object({
  userPermissions: z.array(resourcePermissionSchema),
})

/**
 * Fetches the current user's permissions for the given resources and optional object.
 * The response is validated with Zod at the API boundary.
 *
 * @param resources - The list of resource names to check.
 * @param objectId - Optional object ID to scope the permission check.
 * @returns A promise resolving to the array of resource permissions.
 */
export async function getUserPermissions(
  resources: string[],
  objectId?: string,
): Promise<ResourcePermission[]> {
  const raw = await graphqlClient.request(QUERY, { resources, objectId })
  const parsed = responseSchema.parse(raw)
  return parsed.userPermissions
}
