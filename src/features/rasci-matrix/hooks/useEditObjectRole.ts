import { useMutation, useQueryClient } from '@tanstack/react-query'
import i18n from 'i18next'

import { extractRasciErrorCode, getRasciErrorKey, roleQueryKeys } from '@/entities/role'
import type { DomainType } from '@/entities/role'
import { showError } from '@/shared/components'

import { editObjectRole, type EditObjectRoleInput } from '../api/rasciMatrixMutationApi'

/** Input for the useEditObjectRole mutation hook. */
export interface UseEditObjectRoleInput {
  objectId: string
  domainType: DomainType
  input: EditObjectRoleInput
}

/**
 * TanStack Query mutation hook for editing a custom role on an object matrix.
 * On success, invalidates the object matrix query so the view refreshes.
 * On error, maps the error code via `getRasciErrorKey` and shows an error toast.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useEditObjectRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input }: UseEditObjectRoleInput) => editObjectRole(input),
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
