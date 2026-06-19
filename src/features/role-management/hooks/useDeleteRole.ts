import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import { showError } from '@/shared/components'

import { deleteRole } from '../api/roleManagementMutationApi'

/** Input for the deleteRole mutation. */
export interface UseDeleteRoleInput {
  id: string
  matrixId: string
}

/**
 * TanStack Query mutation hook for deleting a role.
 * On success, invalidates the matrix query so the detail view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: UseDeleteRoleInput) => deleteRole(id),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.matrix({ matrixId: variables.matrixId }),
      })
    },
    onError: (error: unknown) => {
      const errorCode = extractRasciErrorCode(error)
      const i18nKey = getRasciErrorKey(errorCode)
      showError(i18n.t(i18nKey))
    },
  })
}
