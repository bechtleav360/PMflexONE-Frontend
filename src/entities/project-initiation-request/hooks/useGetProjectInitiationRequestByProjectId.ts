import { useQuery } from '@tanstack/react-query'

import { listProjectInitiationRequests } from '../api/listProjectInitiationRequests'
import { listProjectInitiationRequestsQueryKey } from '../types/projectInitiationRequest.types'
import type { ProjectInitiationRequest } from '../types/projectInitiationRequest.types'

/**
 * Returns the first PIR linked to the given project, or `null` if none exists.
 * Uses the shared list cache so no extra network request is made when the PIR
 * list query is already warm.
 *
 * @param projectId - The requesting project identifier.
 * @returns TanStack Query result with `data` as a PIR list item or `null`.
 */
export function useGetProjectInitiationRequestByProjectId(projectId: string) {
  return useQuery({
    queryKey: listProjectInitiationRequestsQueryKey,
    queryFn: () => listProjectInitiationRequests(),
    select: (data: ProjectInitiationRequest[]) =>
      data.find((pir) => pir.requestingProject?.item.id === projectId) ?? null,
    enabled: !!projectId,
    staleTime: 0,
  })
}
