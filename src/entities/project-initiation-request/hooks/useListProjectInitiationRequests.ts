import { useQuery } from '@tanstack/react-query'

import { listProjectInitiationRequests } from '../api/listProjectInitiationRequests'
import { listProjectInitiationRequestsQueryKey } from '../types/projectInitiationRequest.types'

/**
 * Fetches all project initiation requests in the tenant.
 *
 * @returns TanStack Query result with `data`, `isPending`, and `isError`.
 */
export function useListProjectInitiationRequests() {
  return useQuery({
    queryKey: listProjectInitiationRequestsQueryKey,
    queryFn: () => listProjectInitiationRequests(),
    staleTime: 0,
  })
}
