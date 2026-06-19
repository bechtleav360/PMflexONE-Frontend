import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { GET_PLANNING_ROLES, PLANNING_ROLES_KEY } from '../api/planningRolesApi'
import { getPlanningRolesResponseSchema } from '../api/supportServicesApi'

/**
 * Fetches all planning roles for a project.
 *
 * @param projectId - The project ID to fetch planning roles for.
 * @returns TanStack Query result with `PlanningRole[]`.
 */
export function usePlanningRoles(projectId: string) {
  return useQuery({
    queryKey: PLANNING_ROLES_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PLANNING_ROLES, { projectId })
      return getPlanningRolesResponseSchema.parse(raw).planningRoles
    },
    staleTime: 30_000,
    enabled: Boolean(projectId),
  })
}
