import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_SUPPORT_SERVICE,
  GET_SUPPORT_SERVICES,
  getSupportServicesResponseSchema,
  SUPPORT_SERVICE_KEY,
  SUPPORT_SERVICES_KEY,
} from '../api/supportServicesApi'
import { buildSupportServiceTree } from '../utils/buildSupportServiceTree'

/**
 * Fetches all support services for a project and builds the nested tree structure.
 * Both the tree view and list view use this single hook — switching tabs never
 * triggers a second network request because both share the same cache key.
 *
 * @param projectId - The project ID to fetch support services for.
 * @returns TanStack Query result with `tree: SupportServiceTreeNode[]` and `flat: SupportService[]`.
 */
export function useSupportServiceTree(projectId: string) {
  return useQuery({
    queryKey: SUPPORT_SERVICES_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_SUPPORT_SERVICES, { projectId })
      const parsed = getSupportServicesResponseSchema.parse(raw)
      const tree = buildSupportServiceTree(parsed.supportServices)
      return { tree, flat: parsed.supportServices }
    },
    staleTime: 0,
    enabled: Boolean(projectId),
  })
}

/**
 * Fetches a single support service by ID for form pre-fill.
 * Only active when `id` is a non-empty string.
 *
 * @param id - The support service ID to fetch.
 * @returns TanStack Query result with the full support service detail.
 */
export function useSupportService(id: string | null) {
  return useQuery({
    queryKey: SUPPORT_SERVICE_KEY(id ?? ''),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_SUPPORT_SERVICE, { id })
      // The query uses filter: { ids: [$id] } which returns an array
      const parsed = getSupportServicesResponseSchema.parse(raw)
      return parsed.supportServices[0] ?? null
    },
    staleTime: 0,
    enabled: Boolean(id),
  })
}
