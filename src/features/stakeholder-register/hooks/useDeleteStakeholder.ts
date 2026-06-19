import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getStakeholderEntriesQueryKey } from '@/entities/stakeholder'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  deleteStakeholderEntry,
  type DeleteStakeholderEntryInput,
} from '../api/deleteStakeholderApi'
import { isOptimisticLockError } from '../utils/graphqlErrors'

/** Arguments for the delete stakeholder mutation, extends the API input with scope context. */
export interface DeleteStakeholderArgs extends DeleteStakeholderEntryInput {
  scopeType: ScopeType
  scopeId: string
}

/**
 * TanStack mutation hook for deleting a stakeholder entry.
 *
 * Invalidates the stakeholder entries query on success. Maps
 * `OPTIMISTIC_LOCK_ERROR` GraphQL extensions to a toast notification.
 *
 * @returns A mutation result with `mutateAsync` accepting a {@link DeleteStakeholderArgs}.
 */
export function useDeleteStakeholder() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: DeleteStakeholderArgs) =>
      deleteStakeholderEntry({ id: args.id, version: args.version }),
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
