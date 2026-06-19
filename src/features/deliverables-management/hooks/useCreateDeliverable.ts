import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_DELIVERABLE,
  createDeliverableResponseSchema,
  DELIVERABLES_TREE_KEY,
} from '../api/deliverablesApi'

/**
 * Input for the `CreateDeliverable` mutation.
 *
 * @property name - Display name (required).
 * @property businessId - Outline-number identifier; `null` means unset.
 * @property parentId - Parent deliverable ID; `null` creates a root node.
 * @property ownerId - Owner person ID; `null` means unassigned.
 * @property description - Markdown description; `null` means empty.
 * @property otherInformation - Markdown additional info; `null` means empty.
 */
export interface CreateDeliverableInput {
  name: string
  businessId?: string | null
  parentId?: string | null
  ownerId?: string | null
  description?: string | null
  otherInformation?: string | null
}

/**
 * Mutation hook for creating a new deliverable.
 *
 * On success, invalidates the tree query cache for the project so the new
 * node appears immediately.
 *
 * @param projectId - The project ID — sent as `scopeId` with `scopeType: Project`.
 * @returns A TanStack Query mutation object.
 */
export function useCreateDeliverable(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateDeliverableInput) => {
      const raw = await graphqlClient.request(CREATE_DELIVERABLE, {
        input: { ...input, scopeId: projectId, scopeType: 'Project' },
      })
      return createDeliverableResponseSchema.parse(raw).createDeliverable
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DELIVERABLES_TREE_KEY(projectId) })
    },
  })
}
