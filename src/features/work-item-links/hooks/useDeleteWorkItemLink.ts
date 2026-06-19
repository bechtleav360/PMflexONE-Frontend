import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WORK_ITEM_QUERY_KEY } from '@/entities/work-item'

import { deleteWorkItemLink } from '../api/workItemLinkApi'

/**
 * Mutation hook to delete a work item link by ID. Invalidates the source work item query on success.
 * @param workItemId - The source work item ID.
 * @returns TanStack Mutation result for the delete operation.
 */
export function useDeleteWorkItemLink(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (linkId: string) => deleteWorkItemLink(linkId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t('features.workItemLinks.deleteError', 'Failed to delete link.'))
    },
  })
}
