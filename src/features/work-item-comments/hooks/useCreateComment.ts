import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { COMMENTS_QUERY_KEY } from '@/entities/work-item'

import { createComment } from '../api/commentMutationApi'

/**
 * Mutation hook to create a comment on a work item. Invalidates the comments query on success.
 * @param workItemId - The work item to comment on.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateComment(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ text }: { text: string }) => createComment({ workItemId, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t('features.workItemComments.createError', 'Failed to add comment.'))
    },
  })
}
