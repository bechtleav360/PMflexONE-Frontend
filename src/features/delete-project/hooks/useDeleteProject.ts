import { useMutation, useQueryClient } from '@tanstack/react-query'

import { listProjectsQueryKey } from '@/entities/project'
import { withToast } from '@/shared/lib'

import { deleteProject } from '../api/deleteProjectApi'
import { useDeleteProjectStore } from '../store/deleteProjectStore'

/**
 * TanStack mutation hook for deleting a project by ID.
 *
 * On success: closes the confirmation dialog and invalidates the `listProjects`
 * cache so the table refreshes immediately.
 *
 * @returns A TanStack `useMutation` result.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const closeModal = useDeleteProjectStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: async () => {
      closeModal()
      await queryClient.invalidateQueries({ queryKey: listProjectsQueryKey })
    },
  })
}

/**
 * Wraps `useDeleteProject` mutation inside a Promise Toast.
 *
 * Uses `mutateAsync` so the promise resolves/rejects independently of the
 * component lifecycle — per-call `mutate` callbacks are dropped when the
 * component unmounts, which would leave the toast stuck in loading state.
 *
 * @param mutateAsync - The `mutateAsync` function returned by `useDeleteProject`.
 * @param id - The project ID to delete.
 * @param messages - Toast text for loading, success, and error states.
 * @param messages.loading - Text shown while the mutation is in-flight.
 * @param messages.success - Text shown on successful deletion.
 * @param messages.error - Text shown when the mutation fails.
 */
export function deleteWithToast(
  mutateAsync: ReturnType<typeof useDeleteProject>['mutateAsync'],
  id: string,
  messages: { loading: string; success: string; error: string | ((err: unknown) => string) },
) {
  withToast(mutateAsync, id, messages)
}
