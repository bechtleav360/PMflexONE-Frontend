import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { ADD_USER_TO_PLANNING_ROLE, PLANNING_ROLES_KEY } from '../api/planningRolesApi'
import { planningRoleSchema } from '../api/supportServicesApi'

const responseSchema = z.object({ addUserToPlanningRole: planningRoleSchema })

/**
 * Mutation hook for adding a user to a planning role.
 *
 * On success, invalidates the planning roles cache for the project.
 *
 * @param projectId - The project ID — used to scope cache invalidation.
 * @returns A TanStack Query mutation object.
 */
export function useAddUserToPlanningRole(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roleId,
      userId,
      assignedCapacity,
    }: {
      roleId: string
      userId: string
      assignedCapacity: number
    }) => {
      const raw = await graphqlClient.request(ADD_USER_TO_PLANNING_ROLE, {
        roleId,
        userId,
        assignedCapacity,
      })
      return responseSchema.parse(raw).addUserToPlanningRole
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNING_ROLES_KEY(projectId) })
    },
  })
}
