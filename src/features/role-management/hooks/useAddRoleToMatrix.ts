import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import { showError } from '@/shared/components'

import { addRoleToMatrix, type AddRoleInput } from '../api/roleManagementMutationApi'

/**
 * TanStack Query mutation hook for adding a role to a matrix.
 * On success, invalidates the matrix query so the detail view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useAddRoleToMatrix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddRoleInput) => addRoleToMatrix(input),
    onSuccess: async (_data, input) => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.matrix({ matrixId: input.matrixId }),
      })
    },
    onError: (error: unknown) => {
      const errorCode = extractRasciErrorCode(error)
      const i18nKey = getRasciErrorKey(errorCode)
      showError(i18n.t(i18nKey))
    },
  })
}
