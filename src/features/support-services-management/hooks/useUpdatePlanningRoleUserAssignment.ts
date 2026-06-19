import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { PLANNING_ROLES_KEY, UPDATE_PLANNING_ROLE_USER_ASSIGNMENT } from '../api/planningRolesApi'
import { planningRoleSchema } from '../api/supportServicesApi'

const responseSchema = z.object({ updatePlanningRoleUserAssignment: planningRoleSchema })

/**
 * Mutation hook for updating a user assignment on a planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope cache invalidation.
 * @returns A TanStack Query mutation object.
 */
export function useUpdatePlanningRoleUserAssignment(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roleId,
      assignmentId,
      assignedCapacity,
    }: {
      roleId: string
      assignmentId: string
      assignedCapacity: number
    }) => {
      const raw = await graphqlClient.request(UPDATE_PLANNING_ROLE_USER_ASSIGNMENT, {
        roleId,
        assignmentId,
        assignedCapacity,
      })
      return responseSchema.parse(raw).updatePlanningRoleUserAssignment
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
