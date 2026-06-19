import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getProjectQueryKey } from '@/entities/project'
import {
  getProjectCharterByProjectIdQueryKey,
  getProjectCharterQueryKey,
} from '@/entities/project-charter'

import {
  submitProjectCharter,
  type SubmitProjectCharterInput,
} from '../api/submitProjectCharterApi'

/**
 * TanStack Query mutation hook for submitting a project charter for acceptance.
 * On success, invalidates the charter detail, charter-by-project, and project queries.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useSubmitProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitProjectCharterInput) => submitProjectCharter(input),
    onSuccess: async (data) => {
      const projectId = data.project?.id ?? ''
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getProjectCharterQueryKey(data.id) }),
        queryClient.invalidateQueries({
          queryKey: getProjectCharterByProjectIdQueryKey(projectId),
        }),
        queryClient.invalidateQueries({ queryKey: getProjectQueryKey(projectId) }),
      ])
    },
  })
}
