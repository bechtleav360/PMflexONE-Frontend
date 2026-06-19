import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getProjectInitiationRequestQueryKey,
  listProjectInitiationRequestsQueryKey,
} from '@/entities/project-initiation-request'

import {
  updateProjectInitiationRequest,
  type UpdateProjectInitiationRequestInput,
} from '../api/updateProjectInitiationRequestApi'

/**
 * TanStack Query mutation hook for updating an existing draft PIR.
 * On success, invalidates both the PIR list query and the individual PIR detail query.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useUpdateProjectInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInitiationRequestInput }) =>
      updateProjectInitiationRequest(id, input),
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
