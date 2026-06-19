import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getStakeholderEntriesQueryKey } from '@/entities/stakeholder'

import { updateStakeholderEntry, type UpdateStakeholderArgs } from '../api/updateStakeholderApi'
import { isOptimisticLockError } from '../utils/graphqlErrors'

/**
 * TanStack mutation hook for updating an existing stakeholder entry.
 *
 * Invalidates the stakeholder entries query on success. Maps
 * `OPTIMISTIC_LOCK_ERROR` GraphQL extensions to a toast notification.
 *
 * @returns A mutation result with `mutateAsync` accepting a {@link UpdateStakeholderArgs}.
 */
export function useUpdateStakeholder() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: UpdateStakeholderArgs) => updateStakeholderEntry(args),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getStakeholderEntriesQueryKey(variables.scopeType, variables.scopeId),
      })
    },
    onError: (error: unknown) => {
      if (isOptimisticLockError(error)) {
        toast.error(t('pages.stakeholderRegister.toast.optimisticLockError'))
      }
    },
  })
}
