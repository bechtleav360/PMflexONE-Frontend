import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getProjectInitiationRequestQueryKey,
  listProjectInitiationRequestsQueryKey,
} from '@/entities/project-initiation-request'

import { submitProjectInitiationRequest } from '../api/submitProjectInitiationRequestApi'

/**
 * TanStack Query mutation hook for submitting a project initiation request.
 * On success, invalidates both the PIR list query and the individual PIR detail query.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useSubmitProjectInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      submitProjectInitiationRequest(id, version),
    onSuccess: async (_data, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: listProjectInitiationRequestsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getProjectInitiationRequestQueryKey(id),
        }),
      ])
    },
  })
}
