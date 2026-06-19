import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_INITIATION_REQUESTS_BY_PROJECT_ID,
  INITIATION_REQUESTS_BY_PROJECT_QUERY_KEY,
  initiationRequestsByProjectResponseSchema,
} from '../api/goalApi'

/**
 * Fetches all initiation requests belonging to a project.
 *
 * @param projectId - The project ID.
 * @returns TanStack Query result with the initiation request list.
 */
export function useInitiationRequestsByProjectId(projectId: string) {
  return useQuery({
    queryKey: INITIATION_REQUESTS_BY_PROJECT_QUERY_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_INITIATION_REQUESTS_BY_PROJECT_ID, { projectId })
      return initiationRequestsByProjectResponseSchema.parse(raw).initiationRequestsByProjectId
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
