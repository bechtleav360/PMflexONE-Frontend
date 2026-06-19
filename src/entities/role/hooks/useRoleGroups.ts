import { useQuery } from '@tanstack/react-query'

import { getRoleGroups } from '../api/getRoleGroups'
import { roleQueryKeys } from '../model/role.queryKeys'
import type { RoleGroup } from '../model/role.types'

/**
 * Fetches all role groups and returns the React Query result.
 *
 * @returns The React Query result containing the array of role groups.
 */
export function useRoleGroups() {
  return useQuery<RoleGroup[]>({
    queryKey: roleQueryKeys.roleGroups(),
    queryFn: () => getRoleGroups(),
    staleTime: 0,
  })
}
