import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { COMMENTS_QUERY_KEY } from '@/entities/work-item'

import { updateComment } from '../api/commentMutationApi'

/**
 * Mutation hook to update a comment's text. Invalidates the comments query on success.
 * @param workItemId - The work item the comment belongs to.
 * @returns TanStack Mutation result for the update operation.
 */
export function useUpdateComment(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, version, text }: { id: string; version: number; text: string }) =>
      updateComment({ id, version, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t('features.workItemComments.updateError', 'Failed to update comment.'))
    },
  })
}
