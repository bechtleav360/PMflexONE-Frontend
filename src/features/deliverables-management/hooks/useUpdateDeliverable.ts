import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELIVERABLE_KEY,
  DELIVERABLES_TREE_KEY,
  UPDATE_DELIVERABLE,
  updateDeliverableResponseSchema,
} from '../api/deliverablesApi'

/**
 * Input for the `UpdateDeliverable` mutation.
 *
 * All fields except `version` are optional — omitting a field leaves the
 * server value unchanged.
 *
 * @property version - Optimistic-lock version of the deliverable.
 * @property name - Display name.
 * @property businessId - Outline-number identifier; `null` clears it.
 * @property ownerId - Owner person ID; `null` clears it.
 * @property description - Markdown description; `null` clears it.
 * @property otherInformation - Markdown additional info; `null` clears it.
 */
export interface UpdateDeliverableInput {
  version: number
  name?: string
  businessId?: string | null
  ownerId?: string | null
  description?: string | null
  otherInformation?: string | null
}

/**
 * Mutation hook for updating an existing deliverable.
 *
 * On success, invalidates the tree cache and the individual deliverable
 * cache so the modal pre-fill reflects the latest data.
 *
 * @param projectId - The project ID — used to invalidate the correct tree key.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateDeliverable(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateDeliverableInput }) => {
      const raw = await graphqlClient.request(UPDATE_DELIVERABLE, { id, input })
      return updateDeliverableResponseSchema.parse(raw).updateDeliverable
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: DELIVERABLES_TREE_KEY(projectId) })
      void queryClient.invalidateQueries({ queryKey: DELIVERABLE_KEY(data.id) })
    },
  })
}
