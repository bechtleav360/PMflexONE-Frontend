import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { COMMENTS_QUERY_KEY } from '@/entities/work-item'

import { deleteComment } from '../api/commentMutationApi'

/**
 * Mutation hook to delete a comment by ID. Invalidates the comments query on success.
 * @param workItemId - The work item the comment belongs to.
 * @returns TanStack Mutation result for the delete operation.
 */
export function useDeleteComment(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteComment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t('features.workItemComments.deleteError', 'Failed to delete comment.'))
    },
  })
}
