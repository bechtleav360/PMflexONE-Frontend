import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getStrategyDescriptionQueryKey } from '@/entities/stakeholder'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  upsertStrategyDescription,
  type UpsertStrategyDescriptionInput,
} from '../api/upsertStrategyDescriptionApi'

/** Arguments for the upsert strategy description mutation. */
export interface UpsertStrategyDescriptionArgs {
  scopeType: ScopeType
  scopeId: string
  input: UpsertStrategyDescriptionInput
}

/**
 * TanStack mutation hook for upserting the strategy description of a scope.
 *
 * On success, invalidates the strategy description query for the relevant scope.
 *
 * @returns A mutation result with `mutateAsync` accepting a {@link UpsertStrategyDescriptionArgs}.
 */
export function useUpsertStrategyDescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: UpsertStrategyDescriptionArgs) =>
      upsertStrategyDescription(args.scopeType, args.scopeId, args.input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: getStrategyDescriptionQueryKey(variables.scopeType, variables.scopeId),
      })
    },
  })
}
