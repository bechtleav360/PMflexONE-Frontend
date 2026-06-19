import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import { showError } from '@/shared/components'

import { deleteRoleGroup } from '../api/governanceGroupMutationApi'

/**
 * TanStack Query mutation hook for deleting a role group.
 * On success, invalidates the roleGroups query.
 * On error, falls back to the generic unknown error key (no RasciErrorCode mapping for groups).
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useDeleteRoleGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoleGroup(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.roleGroups(),
      })
    },
    onError: (error) => {
      const code = extractRasciErrorCode(error)
      showError(i18n.t(getRasciErrorKey(code)))
    },
  })
}
