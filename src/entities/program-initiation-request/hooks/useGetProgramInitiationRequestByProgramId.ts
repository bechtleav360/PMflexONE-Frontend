import { useQuery } from '@tanstack/react-query'

import { listProgramInitiationRequests } from '../api/listProgramInitiationRequests'
import { listProgramInitiationRequestsQueryKey } from '../types/programInitiationRequest.types'
import type { ProgramInitiationRequest } from '../types/programInitiationRequest.types'

/**
 * Returns the first program PIR linked to the given program, or `null` if none exists.
 * Uses the shared list cache so no extra network request is made when the list query is already warm.
 *
 * @param programId - The requesting program identifier.
 * @returns TanStack Query result with `data` as a program PIR list item or `null`.
 */
export function useGetProgramInitiationRequestByProgramId(programId: string) {
  return useQuery({
    queryKey: listProgramInitiationRequestsQueryKey,
    queryFn: () => listProgramInitiationRequests(),
    select: (data: ProgramInitiationRequest[]) =>
      data.find((pir) => pir.requestingProgram?.item.id === programId) ?? null,
    enabled: !!programId,
    staleTime: 0,
  })
}
