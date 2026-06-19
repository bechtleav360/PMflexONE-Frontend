import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  CREATE_SUPPORT_SERVICE,
  createSupportServiceResponseSchema,
  SUPPORT_SERVICES_KEY,
} from '../api/supportServicesApi'

/**
 * Input for the `CreateSupportService` mutation.
 *
 * @property name - Display name (required).
 * @property parentId - Parent support service ID; `null` creates a root node.
 * @property assigneeId - Planning role ID; `null` means unassigned.
 * @property estimatedEffort - Estimated effort in PT; `null` means unset.
 * @property description - Markdown description; `null` means empty.
 * @property otherInformation - Markdown additional info; `null` means empty.
 */
export interface CreateSupportServiceInput {
  name: string
  parentId?: string | null
  assigneeId?: string | null
  estimatedEffort?: number | null
  description?: string | null
  otherInformation?: string | null
}

/**
 * Mutation hook for creating a new support service.
 *
 * On success, invalidates the tree query cache for the project so the new
 * node appears immediately. Toast is handled by the calling page/form.
 *
 * @param projectId - The project ID — sent as `projectId`.
 * @returns A TanStack Query mutation object.
 */
export function useCreateSupportService(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSupportServiceInput) => {
      const raw = await graphqlClient.request(CREATE_SUPPORT_SERVICE, {
        input: { scopeId: projectId, scopeType: 'Project', ...input },
      })
      return createSupportServiceResponseSchema.parse(raw).createSupportService
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICES_KEY(projectId) })
    },
  })
}
