import { useMutation, useQueryClient } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  DELETE_SUPPORT_SERVICE,
  deleteSupportServiceResponseSchema,
  SUPPORT_SERVICE_KEY,
  SUPPORT_SERVICES_KEY,
} from '../api/supportServicesApi'

/**
 * Mutation hook for deleting a support service.
 *
 * Pass `CASCADE_DELETE` to delete the service and all descendants.
 * Pass `PROMOTE_CHILDREN` to delete only this node and re-parent its direct children.
 * On success, invalidates the tree cache.
 *
 * @param projectId - The project ID — used to invalidate the correct tree key.
 * @returns A TanStack Query mutation object.
 */
export function useDeleteSupportService(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      version,
      deleteMode,
    }: {
      id: string
      version: number
      deleteMode: 'CASCADE_DELETE' | 'PROMOTE_CHILDREN'
    }) => {
      const raw = await graphqlClient.request(DELETE_SUPPORT_SERVICE, { id, version, deleteMode })
      return deleteSupportServiceResponseSchema.parse(raw).deleteSupportService
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICES_KEY(projectId) })
      void queryClient.invalidateQueries({ queryKey: SUPPORT_SERVICE_KEY(id) })
    },
  })
}
