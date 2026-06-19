import { useQuery } from '@tanstack/react-query'

import { getTaskGroups } from '../api/getTaskGroups'
import { roleQueryKeys } from '../model/role.queryKeys'
import type { TaskGroup } from '../model/role.types'

/**
 * Fetches all task groups and returns the React Query result.
 *
 * @returns The React Query result containing the array of task groups.
 */
export function useTaskGroups() {
  return useQuery<TaskGroup[]>({
    queryKey: roleQueryKeys.taskGroups(),
    queryFn: () => getTaskGroups(),
    staleTime: 0,
  })
}
