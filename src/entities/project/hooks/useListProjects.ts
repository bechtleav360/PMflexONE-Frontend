import { useQuery } from '@tanstack/react-query'

import type { ProjectFilter } from '../api/listProjects'
import { listProjects } from '../api/listProjects'
import type { Project } from '../types/project.types'

/** TanStack Query key for the unfiltered project list. */
export const listProjectsQueryKey = ['listProjects'] as const

/**
 * Fetches the list of projects for the current tenant, with optional server-side filtering.
 *
 * `staleTime: 0` ensures the list is always re-fetched when the component
 * mounts after a successful project creation (cache invalidation triggers
 * a background refetch).
 *
 * When `filter` is provided the query key includes the filter object so each
 * unique filter combination gets its own cache entry.
 *
 * @param root0 - Hook options.
 * @param root0.filter - Optional filter forwarded to the GraphQL `ProjectFilter` argument.
 * @returns A TanStack Query result containing the array of projects.
 */
export function useListProjects({ filter }: { filter?: ProjectFilter } = {}) {
  return useQuery<Project[]>({
    queryKey: filter ? [...listProjectsQueryKey, filter] : listProjectsQueryKey,
    queryFn: () => listProjects(filter),
    staleTime: 0,
  })
}
