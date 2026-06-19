import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { CREATE_PLANNING_ROLE, PLANNING_ROLES_KEY } from '../api/planningRolesApi'
import { createPlanningRoleResponseSchema } from '../api/supportServicesApi'

/**
 * Input for the `CreatePlanningRole` mutation.
 *
 * @property name - Display name of the planning role (required).
 * @property capacityPerWeek - Capacity in person-days per week (required, > 0).
 */
export interface CreatePlanningRoleInput {
  name: string
  capacityPerWeek: number
}

/**
 * Mutation hook for creating a new planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope the planning role and invalidate cache.
 * @returns A TanStack Query mutation object.
 */
export function useCreatePlanningRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePlanningRoleInput) => {
      const raw = await graphqlClient.request(CREATE_PLANNING_ROLE, {
        input: { scopeId: projectId, scopeType: 'Project', ...input },
      })
      return createPlanningRoleResponseSchema.parse(raw).createPlanningRole
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
