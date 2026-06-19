import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import { showError } from '@/shared/components'

import { editRoleGroup, type EditRoleGroupInput } from '../api/governanceGroupMutationApi'

/**
 * TanStack Query mutation hook for editing an existing role group.
 * On success, invalidates the roleGroups query.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useEditRoleGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EditRoleGroupInput) => editRoleGroup(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.roleGroups(),
      })
    },
    onError: (error: unknown) => {
      const errorCode = extractRasciErrorCode(error)
      const i18nKey = getRasciErrorKey(errorCode)
      showError(i18n.t(i18nKey))
    },
  })
}
