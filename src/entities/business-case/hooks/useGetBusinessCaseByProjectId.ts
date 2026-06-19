import { useQuery } from '@tanstack/react-query'

import { getBusinessCaseByProjectId } from '../api/getBusinessCaseByProjectId'
import { getBusinessCaseByProjectIdQueryKey } from '../types/businessCase.types'

/**
 * Fetches the Business Case summary (id, status) for a given project.
 * Returns null when no BC has been created for the project yet.
 * Only enabled when `projectId` is a non-empty string.
 *
 * @param projectId - The project identifier.
 * @returns TanStack Query result with `data` as `{ id, status } | null`.
 */
export function useGetBusinessCaseByProjectId(projectId: string) {
  return useQuery({
    queryKey: getBusinessCaseByProjectIdQueryKey(projectId),
    queryFn: () => getBusinessCaseByProjectId(projectId),
    enabled: projectId.length > 0,
    staleTime: 0,
  })
}
