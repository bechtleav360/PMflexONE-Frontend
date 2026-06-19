import { useQuery } from '@tanstack/react-query'

import { getProgramInitiationRequest } from '../api/getProgramInitiationRequest'
import { getProgramInitiationRequestQueryKey } from '../types/programInitiationRequest.types'

/**
 * Fetches a single program initiation request by ID.
 *
 * @param id - The program PIR identifier.
 * @returns TanStack Query result containing the full program PIR detail.
 */
export function useGetProgramInitiationRequest(id: string) {
  return useQuery({
    queryKey: getProgramInitiationRequestQueryKey(id),
    queryFn: () => getProgramInitiationRequest(id),
    enabled: !!id,
    staleTime: 0,
  })
}
