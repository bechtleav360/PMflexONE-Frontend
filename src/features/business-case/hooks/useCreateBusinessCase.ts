import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getBusinessCaseByProjectIdQueryKey } from '@/entities/business-case'

import { createBusinessCase, type CreateBusinessCaseInput } from '../api/createBusinessCaseApi'

/**
 * TanStack Query mutation hook for creating a new Business Case.
 * On success, invalidates the businessCaseByProjectId query for the project
 * so the PIR detail page navigation entry refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useCreateBusinessCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBusinessCaseInput) => createBusinessCase(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: getBusinessCaseByProjectIdQueryKey(data.project?.id ?? ''),
      })
    },
  })
}
