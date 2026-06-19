import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_PROJECT_CHARTER_BY_PROJECT_ID,
  PROJECT_CHARTER_BY_PROJECT_QUERY_KEY,
  projectCharterByProjectResponseSchema,
} from '../api/goalApi'

/**
 * Fetches the project charter linked to a project.
 *
 * Returns `null` when no project charter exists for the project.
 * Query is disabled when `projectId` is falsy.
 *
 * @param projectId - The project ID.
 * @returns TanStack Query result containing the project charter or `null`.
 */
export function useProjectCharterByProjectId(projectId: string) {
  return useQuery({
    queryKey: PROJECT_CHARTER_BY_PROJECT_QUERY_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PROJECT_CHARTER_BY_PROJECT_ID, { projectId })
      return projectCharterByProjectResponseSchema.parse(raw).projectCharterByProjectId
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
