import { useQuery } from '@tanstack/react-query'

import { getUserPermissions } from '../api/getUserPermissions'
import { roleQueryKeys } from '../model/role.queryKeys'
import type { ResourcePermission } from '../model/role.types'

/**
 * Fetches the current user's permissions for the given resources and optional object
 * and returns the React Query result.
 *
 * @param resources - The list of resource names to check.
 * @param objectId - Optional object ID to scope the permission check.
 * @returns The React Query result containing the array of resource permissions.
 */
export function useUserPermissions(resources: string[], objectId?: string) {
  return useQuery<ResourcePermission[]>({
    queryKey: roleQueryKeys.userPermissions(resources, objectId),
    queryFn: () => getUserPermissions(resources, objectId),
    staleTime: 0,
  })
}
