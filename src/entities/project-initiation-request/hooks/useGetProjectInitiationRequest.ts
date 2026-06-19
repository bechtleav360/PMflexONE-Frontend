import { useQuery } from '@tanstack/react-query'

import { getProjectInitiationRequest } from '../api/getProjectInitiationRequest'
import { getProjectInitiationRequestQueryKey } from '../types/projectInitiationRequest.types'

/**
 * Fetches a single project initiation request by ID.
 * Only enabled when `id` is a non-empty string.
 *
 * @param id - The PIR identifier.
 * @returns TanStack Query result with `data`, `isPending`, and `isError`.
 */
export function useGetProjectInitiationRequest(id: string) {
  return useQuery({
    queryKey: getProjectInitiationRequestQueryKey(id),
    queryFn: () => getProjectInitiationRequest(id),
    enabled: id.length > 0,
    staleTime: 0,
  })
}
