import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { COMMENTS_QUERY_KEY, WORK_ITEM_ATTACHMENTS_QUERY_KEY } from '@/entities/work-item'

import { deleteAttachment } from '../api/attachmentApi'

/**
 * Mutation hook to delete an attachment. Invalidates both the work item and comments queries on success.
 * @param workItemId - The work item whose attachment is being deleted.
 * @returns TanStack Mutation result for the delete operation.
 */
export function useDeleteAttachment(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => deleteAttachment(id, version),
    onSuccess: async (_, { id }) => {
      // Remove immediately from the attachments cache so the row disappears without waiting for a refetch.
      queryClient.setQueryData<Array<{ id: string }>>(
        WORK_ITEM_ATTACHMENTS_QUERY_KEY(workItemId),
        (old) => (old ?? []).filter((a) => a.id !== id),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_ATTACHMENTS_QUERY_KEY(workItemId) }),
        queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(workItemId) }),
      ])
    },
    onError: () => {
      toast.error(t('features.workItemAttachments.deleteError', 'Failed to delete attachment.'))
    },
  })
}
