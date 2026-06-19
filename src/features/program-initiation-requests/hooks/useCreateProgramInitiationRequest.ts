import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listProgramInitiationRequestsQueryKey } from '@/entities/program-initiation-request'

import {
  createProgramInitiationRequest,
  type CreateProgramInitiationRequestInput,
} from '../api/createProgramInitiationRequestApi'

/**
 * TanStack Query mutation hook for creating a new program initiation request.
 * On success, invalidates the program PIR list query so the overview refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useCreateProgramInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProgramInitiationRequestInput) =>
      createProgramInitiationRequest(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listProgramInitiationRequestsQueryKey,
      })
    },
  })
}
