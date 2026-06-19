import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import type { DomainType } from '@/entities/role'
import { showError } from '@/shared/components'

import { addRoleToObjectMatrix, type AddObjectRoleInput } from '../api/rasciMatrixMutationApi'

/** Input for the useAddRoleToObjectMatrix mutation hook. */
export interface UseAddRoleToObjectMatrixInput {
  objectId: string
  domainType: DomainType
  input: AddObjectRoleInput
}

/**
 * TanStack Query mutation hook for adding a custom role to an object matrix.
 * On success, invalidates the object matrix query so the view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useAddRoleToObjectMatrix() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input }: UseAddRoleToObjectMatrixInput) => addRoleToObjectMatrix(input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.matrix({
          domainType: variables.domainType,
          objectId: variables.objectId,
        }),
      })
    },
    onError: (error: unknown) => {
      const errorCode = extractRasciErrorCode(error)
      const i18nKey = getRasciErrorKey(errorCode)
      showError(i18n.t(i18nKey))
    },
  })
}
