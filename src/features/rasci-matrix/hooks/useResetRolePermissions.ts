import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import type { DomainType } from '@/entities/role'
import { showError } from '@/shared/components'

import { resetRolePermissions, type ResetRolePermissionsInput } from '../api/rasciMatrixMutationApi'

/** Input for the mutation including domainType for cache invalidation. */
export interface UseResetRolePermissionsInput extends ResetRolePermissionsInput {
  domainType: DomainType
}

/**
 * TanStack Query mutation hook for resetting all permission overrides for a role.
 * On success, invalidates the object matrix query so the view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useResetRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ domainType: _domainType, ...input }: UseResetRolePermissionsInput) =>
      resetRolePermissions(input),
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
