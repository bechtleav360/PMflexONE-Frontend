import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { DELETE_REQUIREMENT, REQUIREMENTS_QUERY_KEY } from '../api/requirementApi'
import type { PlanningObjectScopeType } from '../types/shared.types'

/**
 * Mutation hook for deleting a requirement.
 *
 * @param scopeType - Scope context (`'Project'`).
 * @param scopeId - The ID of the scoped entity.
 * @returns A TanStack Query mutation object.
 */
export function useDeleteRequirement(scopeType: PlanningObjectScopeType, scopeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      cascade,
    }: {
      id: string
      version: number
      cascade: boolean
    }) => {
      await graphqlClient.request(DELETE_REQUIREMENT, { id, version, cascade })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
