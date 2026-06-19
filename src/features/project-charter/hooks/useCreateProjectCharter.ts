import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getProjectCharterByProjectIdQueryKey } from '@/entities/project-charter'

import {
  createProjectCharter,
  type CreateProjectCharterInput,
} from '../api/createProjectCharterApi'

/**
 * TanStack Query mutation hook for creating a new project charter.
 * On success, invalidates the charter-by-project query so the detail page refreshes.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useCreateProjectCharter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectCharterInput) => createProjectCharter(input),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: getProjectCharterByProjectIdQueryKey(data.project?.id ?? ''),
      })
    },
  })
}
