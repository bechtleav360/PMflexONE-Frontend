import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listProjectInitiationRequestsQueryKey } from '@/entities/project-initiation-request'
import { showPromise } from '@/shared/components'

import { deleteProjectInitiationRequest } from '../api/deleteProjectInitiationRequestApi'

/**
 * TanStack Query mutation hook for deleting a project initiation request by ID.
 * On success, invalidates the PIR list query so the overview refreshes automatically.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and `error`.
 */
export function useDeleteProjectInitiationRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProjectInitiationRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listProjectInitiationRequestsQueryKey })
    },
  })
}

/**
 * Wraps `useDeleteProjectInitiationRequest` mutation inside a Promise Toast.
 * Call this from the delete button click handler.
 *
 * @param mutateAsync - The `mutateAsync` function returned by `useDeleteProjectInitiationRequest`.
 * @param id - The PIR ID to delete.
 * @param messages - Toast text for loading, success, and error states.
 * @param messages.loading - Text shown while the mutation is in-flight.
 * @param messages.success - Text shown on successful deletion.
 * @param messages.error - Text shown when the mutation fails.
 */
export function deletePIRWithToast(
  mutateAsync: ReturnType<typeof useDeleteProjectInitiationRequest>['mutateAsync'],
  id: string,
  messages: { loading: string; success: string; error: string | ((err: unknown) => string) },
) {
  showPromise(mutateAsync(id), messages)
}
