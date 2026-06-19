import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { PLANNING_ROLES_KEY, REMOVE_USER_FROM_PLANNING_ROLE } from '../api/planningRolesApi'
import { planningRoleSchema } from '../api/supportServicesApi'

const responseSchema = z.object({ removeUserFromPlanningRole: planningRoleSchema })

/**
 * Mutation hook for removing a user from a planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope cache invalidation.
 * @returns A TanStack Query mutation object.
 */
export function useRemoveUserFromPlanningRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roleId, assignmentId }: { roleId: string; assignmentId: string }) => {
      const raw = await graphqlClient.request(REMOVE_USER_FROM_PLANNING_ROLE, {
        roleId,
        assignmentId,
      })
      return responseSchema.parse(raw).removeUserFromPlanningRole
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
