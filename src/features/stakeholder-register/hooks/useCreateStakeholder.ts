import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getStakeholderEntriesQueryKey } from '@/entities/stakeholder'

import { createStakeholderEntry } from '../api/createStakeholderApi'
import type { CreateStakeholderInput } from '../utils/stakeholderMappers'

/**
 * TanStack mutation hook for creating a new stakeholder entry.
 *
 * On success, invalidates the stakeholder entries query for the relevant scope.
 *
 * @returns A mutation result with `mutateAsync` accepting a {@link CreateStakeholderInput}.
 */
export function useCreateStakeholder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateStakeholderInput) => createStakeholderEntry(input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getStakeholderEntriesQueryKey(variables.scopeType, variables.scopeId),
      })
    },
  })
}
