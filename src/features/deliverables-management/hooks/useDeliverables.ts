import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELIVERABLE_KEY,
  DELIVERABLES_TREE_KEY,
  GET_DELIVERABLE,
  GET_DELIVERABLE_TREE,
  getDeliverableResponseSchema,
  getDeliverableTreeResponseSchema,
} from '../api/deliverablesApi'
import { buildDeliverableTree } from '../utils/buildDeliverableTree'

/**
 * Fetches all deliverables for a project and builds the nested tree structure.
 * Both the tree view and list view use this single hook — switching tabs never
 * triggers a second network request because both share the same cache key.
 *
 * @param projectId - The project ID to fetch deliverables for.
 * @returns TanStack Query result with `tree: DeliverableTreeNode[]` and `flat: Deliverable[]`.
 */
export function useDeliverableTree(projectId: string) {
  return useQuery({
    queryKey: DELIVERABLES_TREE_KEY(projectId),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_DELIVERABLE_TREE, { projectId })
      const parsed = getDeliverableTreeResponseSchema.parse(raw)
      const tree = buildDeliverableTree(parsed.deliverables)
      return { tree, flat: parsed.deliverables }
    },
    staleTime: 30_000,
    enabled: Boolean(projectId),
  })
}

/**
 * Fetches a single deliverable by ID for modal pre-fill.
 * Only active when `id` is a non-empty string.
 *
 * @param id - The deliverable ID to fetch.
 * @returns TanStack Query result with the full deliverable detail.
 */
export function useDeliverable(id: string | null) {
  return useQuery({
    queryKey: DELIVERABLE_KEY(id ?? ''),
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_DELIVERABLE, { id })
      const list = getDeliverableResponseSchema.parse(raw).deliverables
      return list[0] ?? null
    },
    staleTime: 30_000,
    enabled: Boolean(id),
  })
}
