import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import type { DomainType } from '@/entities/role'
import { showError } from '@/shared/components'

import {
  changeObjectRolePermission,
  type ChangeObjectRolePermissionInput,
} from '../api/rasciMatrixMutationApi'

/** Input for the mutation including domainType for cache invalidation. */
export interface UseChangeObjectRolePermissionInput extends ChangeObjectRolePermissionInput {
  domainType: DomainType
}

/**
 * TanStack Query mutation hook for changing a single RASCI cell value on an object matrix.
 * On success, invalidates the object matrix query so the view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useChangeObjectRolePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ domainType: _domainType, ...input }: UseChangeObjectRolePermissionInput) =>
      changeObjectRolePermission(input),
    onSuccess: async (_data, input) => {
      await queryClient.invalidateQueries({
        queryKey: roleQueryKeys.matrix({ domainType: input.domainType, objectId: input.objectId }),
      })
    },
    onError: (error: unknown) => {
      const errorCode = extractRasciErrorCode(error)
      const i18nKey = getRasciErrorKey(errorCode)
      showError(i18n.t(i18nKey))
    },
  })
}
