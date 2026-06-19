import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getProgramInitiationRequestQueryKey,
  listProgramInitiationRequestsQueryKey,
} from '@/entities/program-initiation-request'

import { submitProgramInitiationRequest } from '../api/submitProgramInitiationRequestApi'

/**
 * TanStack Query mutation hook for submitting a program initiation request.
 * On success, invalidates both the list and individual detail queries.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useSubmitProgramInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      submitProgramInitiationRequest(id, version),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listProgramInitiationRequestsQueryKey }),
        queryClient.invalidateQueries({ queryKey: getProgramInitiationRequestQueryKey(id) }),
      ])
    },
  })
}
