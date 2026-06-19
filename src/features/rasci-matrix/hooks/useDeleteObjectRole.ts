import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import type { DomainType } from '@/entities/role'
import { showError } from '@/shared/components'

import { deleteObjectRole } from '../api/rasciMatrixMutationApi'

/** Input for the useDeleteObjectRole mutation hook. */
export interface UseDeleteObjectRoleInput {
  id: string
  objectId: string
  domainType: DomainType
}

/**
 * TanStack Query mutation hook for deleting a custom role from an object matrix.
 * On success, invalidates the object matrix query so the view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useDeleteObjectRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, objectId }: UseDeleteObjectRoleInput) => deleteObjectRole({ id, objectId }),
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
