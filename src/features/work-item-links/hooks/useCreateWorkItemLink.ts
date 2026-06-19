import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { WORK_ITEM_QUERY_KEY } from '@/entities/work-item'
import type { CreateWorkItemLinkInput } from '@/entities/work-item'

import { createWorkItemLink } from '../api/workItemLinkApi'

/**
 * Mutation hook to create a typed link between two work items. Invalidates the source work item query on success.
 * @param workItemId - The source work item ID.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateWorkItemLink(workItemId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ input }: { input: CreateWorkItemLinkInput }) => createWorkItemLink(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(workItemId) })
    },
    onError: () => {
      toast.error(t('features.workItemLinks.createError', 'Failed to create link.'))
    },
  })
}
