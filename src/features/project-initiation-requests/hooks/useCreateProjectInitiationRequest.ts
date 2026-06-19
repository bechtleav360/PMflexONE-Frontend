import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listProjectInitiationRequestsQueryKey } from '@/entities/project-initiation-request'

import {
  createProjectInitiationRequest,
  type CreateProjectInitiationRequestInput,
} from '../api/createProjectInitiationRequestApi'

/**
 * TanStack Query mutation hook for creating a new project initiation request.
 * On success, invalidates the PIR list query so the overview refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useCreateProjectInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInitiationRequestInput) =>
      createProjectInitiationRequest(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: listProjectInitiationRequestsQueryKey,
      })
    },
  })
}
