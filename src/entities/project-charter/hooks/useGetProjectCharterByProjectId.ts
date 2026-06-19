import { useQuery } from '@tanstack/react-query'

import { getProjectCharterByProjectId } from '../api/getProjectCharterByProjectId'
import { getProjectCharterByProjectIdQueryKey } from '../types/projectCharter.types'

/**
 * @param projectId - ID of the project to look up the charter for.
 * @returns TanStack Query result for the project charter summary, or null if none exists.
 */
export function useGetProjectCharterByProjectId(projectId: string) {
  return useQuery({
    queryKey: getProjectCharterByProjectIdQueryKey(projectId),
    queryFn: () => getProjectCharterByProjectId(projectId),
    enabled: projectId.length > 0,
    staleTime: 0,
  })
}
