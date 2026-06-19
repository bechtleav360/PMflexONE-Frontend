import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { DELETE_PLANNING_ROLE, PLANNING_ROLES_KEY } from '../api/planningRolesApi'

const deleteResponseSchema = z.object({ deletePlanningRole: z.boolean() })

/**
 * Mutation hook for deleting a planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope cache invalidation.
 * @returns A TanStack Query mutation object.
 */
export function useDeletePlanningRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      const raw = await graphqlClient.request(DELETE_PLANNING_ROLE, { id, version })
      return deleteResponseSchema.parse(raw).deletePlanningRole
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
