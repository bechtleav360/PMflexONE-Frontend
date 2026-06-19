import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getProjectCharterByProjectIdQueryKey,
  getProjectCharterQueryKey,
} from '@/entities/project-charter'

import {
  updateProjectCharter,
  type UpdateProjectCharterInput,
} from '../api/updateProjectCharterApi'

/**
 * TanStack Query mutation hook for updating a project charter's content fields.
 * On success, invalidates both the charter detail query and the charter-by-project query.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useUpdateProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectCharterInput) => updateProjectCharter(input),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getProjectCharterQueryKey(data.id) }),
        queryClient.invalidateQueries({
          queryKey: getProjectCharterByProjectIdQueryKey(data.project?.id ?? ''),
        }),
      ])
    },
  })
}
