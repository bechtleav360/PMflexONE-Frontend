import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  SUPPORT_SERVICE_KEY,
  SUPPORT_SERVICES_KEY,
  UPDATE_SUPPORT_SERVICE,
  updateSupportServiceResponseSchema,
} from '../api/supportServicesApi'

/**
 * Input for the `UpdateSupportService` mutation.
 *
 * All fields except `version` are optional — omitting a field leaves the
 * server value unchanged.
 *
 * @property version - Optimistic-lock version of the support service.
 * @property name - Display name.
 * @property assigneeId - Planning role ID to assign; the server ignores an explicit `null`.
 * @property clearAssignee - `true` removes the current assignment.
 * @property estimatedEffort - Effort in PT; `null` clears it.
 * @property description - Markdown description; `null` clears it.
 * @property otherInformation - Markdown additional info; `null` clears it.
 */
export interface UpdateSupportServiceInput {
  version: number
  name?: string
  assigneeId?: string | null
  clearAssignee?: boolean
  estimatedEffort?: number | null
  description?: string | null
  otherInformation?: string | null
}

/**
 * Mutation hook for updating an existing support service.
 *
 * On success, invalidates the tree cache and the individual support service
 * cache so the form pre-fill reflects the latest data.
 *
 * @param projectId - The project ID — used to invalidate the correct tree key.
 * @returns A TanStack Query mutation object.
 */
export function useUpdateSupportService(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSupportServiceInput }) => {
      const raw = await graphqlClient.request(UPDATE_SUPPORT_SERVICE, { id, input })
      return updateSupportServiceResponseSchema.parse(raw).updateSupportService
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICES_KEY(projectId) })
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICE_KEY(data.id) })
    },
  })
}
