import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELETE_DELIVERABLE,
  deleteDeliverableResponseSchema,
  DELIVERABLE_KEY,
  DELIVERABLES_TREE_KEY,
} from '../api/deliverablesApi'

/**
 * Mutation hook for deleting a deliverable and all its descendants.
 *
 * On success, invalidates the tree cache for the project so the UI reflects
 * the removal immediately.
 *
 * @param projectId - The project ID — used to invalidate the correct tree key.
 * @returns A TanStack Query mutation object whose result includes `deletedDescendantCount`.
 */
export function useDeleteDeliverable(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, version }: { id: string; version: number }) => {
      const raw = await graphqlClient.request(DELETE_DELIVERABLE, { id, version })
      return deleteDeliverableResponseSchema.parse(raw).deleteDeliverable
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: DELIVERABLES_TREE_KEY(projectId) })
      void queryClient.invalidateQueries({ queryKey: DELIVERABLE_KEY(id) })
    },
  })
}
