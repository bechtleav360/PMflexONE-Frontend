import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  BUSINESS_CASE_BY_PROJECT_QUERY_KEY,
  businessCaseByProjectResponseSchema,
  GET_BUSINESS_CASE_BY_PROJECT_ID,
} from '../api/goalApi'

/**
 * Fetches the business case linked to a project.
 *
 * Returns `null` when no business case exists for the project.
 * Query is disabled when `projectId` is falsy.
 *
 * @param projectId - The project ID.
 * @returns TanStack Query result containing the business case or `null`.
 */
export function useBusinessCaseByProjectId(projectId: string) {
  return useQuery({
    queryKey: BUSINESS_CASE_BY_PROJECT_QUERY_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_BUSINESS_CASE_BY_PROJECT_ID, { projectId })
      return businessCaseByProjectResponseSchema.parse(raw).businessCaseByProjectId
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  })
}
