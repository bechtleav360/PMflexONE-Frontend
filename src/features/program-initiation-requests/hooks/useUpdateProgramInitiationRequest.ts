import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getProgramInitiationRequestQueryKey,
  listProgramInitiationRequestsQueryKey,
} from '@/entities/program-initiation-request'

import {
  updateProgramInitiationRequest,
  type UpdateProgramInitiationRequestInput,
} from '../api/updateProgramInitiationRequestApi'

/**
 * TanStack Query mutation hook for updating a program initiation request.
 * On success, invalidates both the list and individual detail queries.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useUpdateProgramInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProgramInitiationRequestInput }) =>
      updateProgramInitiationRequest(id, input),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: listProgramInitiationRequestsQueryKey }),
        queryClient.invalidateQueries({ queryKey: getProgramInitiationRequestQueryKey(id) }),
      ])
    },
  })
}
