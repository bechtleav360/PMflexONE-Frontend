import { useMutation, useQueryClient } from '@tanstack/react-query'

import { WORK_ITEM_QUERY_KEY } from '@/entities/work-item'

import { deleteProjectWorkItem } from '../api/workItemMutationApi'
import { useDeleteWorkItemDialogStore } from '../store/workItemDialogStores'

/**
 * Mutation hook to delete a work item. Cache invalidation is handled by the caller
 * via useQueryClient so the exact scope key is available.
 * @returns A TanStack Query mutation object for deleting a work item.
 */
export function useDeleteProjectWorkItem() {
  const queryClient = useQueryClient()
  const closeModal = useDeleteWorkItemDialogStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (id: string) => deleteProjectWorkItem(id),
    onSuccess: (_, id) => {
      closeModal()
      queryClient.removeQueries({ queryKey: WORK_ITEM_QUERY_KEY(id) })
    },
  })
}
