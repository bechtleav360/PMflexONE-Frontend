import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getBusinessCaseByProjectIdQueryKey,
  getBusinessCaseQueryKey,
} from '@/entities/business-case'

import { submitBusinessCase, type SubmitBusinessCaseInput } from '../api/submitBusinessCaseApi'

/**
 * TanStack Query mutation hook for submitting a Business Case (lifecycle transition).
 * Sets status to `submitted` (display label: "Complete").
 * `version` is required for optimistic concurrency control.
 * On success, invalidates both the businessCase detail query and the
 * businessCaseByProjectId query so the PIR detail page button refreshes.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useSubmitBusinessCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitBusinessCaseInput) => submitBusinessCase(input),
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
