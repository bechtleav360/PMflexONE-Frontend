import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { PLANNING_ROLES_KEY, UPDATE_PLANNING_ROLE } from '../api/planningRolesApi'
import { updatePlanningRoleResponseSchema } from '../api/supportServicesApi'

/**
 * Input for the `UpdatePlanningRole` mutation.
 *
 * @property version - Optimistic-lock version.
 * @property name - New display name (optional).
 * @property capacityPerWeek - New capacity in person-days per week (optional).
 */
export interface UpdatePlanningRoleInput {
  version: number
  name?: string
  capacityPerWeek?: number
}

/**
 * Mutation hook for updating an existing planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope cache invalidation.
 * @returns A TanStack Query mutation object.
 */
export function useUpdatePlanningRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePlanningRoleInput }) => {
      const raw = await graphqlClient.request(UPDATE_PLANNING_ROLE, { id, input })
      return updatePlanningRoleResponseSchema.parse(raw).updatePlanningRole
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
