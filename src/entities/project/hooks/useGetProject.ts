import { useQuery } from '@tanstack/react-query'

import { getProject } from '../api/getProject'
import type { Project } from '../types/project.types'

/**
 * Returns the React Query cache key for a project by ID.
 *
 * @param id - The project ID.
 * @returns The query key tuple.
 */
export const getProjectQueryKey = (id: string) => ['getProject', id] as const

/**
 * Fetches a project by ID and returns its React Query result.
 *
 * @param id - The project ID to fetch.
 * @returns The React Query result containing the project data.
 */
export function useGetProject(id: string | null) {
  return useQuery<Project>({
    queryKey: getProjectQueryKey(id ?? ''),
    queryFn: () => getProject(id!),
    enabled: !!id,
    staleTime: 0,
  })
}
