import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getBusinessCaseByProjectIdQueryKey,
  getBusinessCaseQueryKey,
} from '@/entities/business-case'

import { updateBusinessCase, type UpdateBusinessCaseInput } from '../api/updateBusinessCaseApi'

/**
 * TanStack Query mutation hook for updating a Business Case's content fields.
 * `version` is required inside the input for optimistic concurrency control.
 * On success, invalidates both the businessCase detail query and the
 * businessCaseByProjectId query so the PIR detail page button refreshes.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useUpdateBusinessCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateBusinessCaseInput) => updateBusinessCase(input),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getBusinessCaseQueryKey(data.id) }),
        queryClient.invalidateQueries({
          queryKey: getBusinessCaseByProjectIdQueryKey(data.project?.id ?? ''),
        }),
      ])
    },
  })
}
