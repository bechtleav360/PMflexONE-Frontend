import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BOARD_CACHE_PREFIX,
  CHANGE_HISTORY_QUERY_KEY,
  updateProjectWorkItem,
  WORK_ITEM_QUERY_KEY,
  type ProjectWorkItem,
  type UpdateProjectWorkItemInput,
} from '@/entities/work-item'
import { extractGqlErrorMessage, isOptimisticLockConflict } from '@/shared/lib/gqlError'

import { useEditWorkItemDialogStore } from '../store/workItemDialogStores'

/**
 * Mutation hook to update an existing work item. Invalidates the work item and list queries on success.
 * @returns TanStack Mutation result for the update operation.
 */
export function useUpdateProjectWorkItem() {
  const queryClient = useQueryClient()
  const closeModal = useEditWorkItemDialogStore((s) => s.closeModal)
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: { id: string; input: UpdateProjectWorkItemInput }) =>
      updateProjectWorkItem(payload.id, payload.input),
    onSuccess: async (data, variables) => {
      // Merge mutable scalar fields from the mutation response into the cache immediately
      // so the Details tab reflects the new state (e.g. cleared assignee) without
      // waiting for the background refetch. Fields not returned by the mutation
      // (links, attachments, labels, creator) are preserved from the existing entry.
      queryClient.setQueryData<ProjectWorkItem | null>(WORK_ITEM_QUERY_KEY(variables.id), (old) => {
        if (old == null) return old
        return {
          ...old,
          version: data.version,
          name: data.name,
          description: data.description ?? null,
          status: data.status,
          dueDate: data.dueDate ?? null,
          priority: data.priority ?? null,
          assignee: data.assignee ?? null,
          boardColumn: data.boardColumn ?? null,
          updatedAt: data.updatedAt,
          updater: data.updater ?? null,
        }
      })
      closeModal()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['workItems'] }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', variables.id),
        }),
      ])
    },
    onError: (err) => {
      if (isOptimisticLockConflict(err)) {
        toast.error(
          t(
            'features.workItem.optimisticLockConflict',
            'Item was modified by someone else. Please reload and retry.',
          ),
        )
        return
      }
      const gqlMessage = extractGqlErrorMessage(err)
      if (gqlMessage) {
        toast.error(gqlMessage)
      }
    },
  })
}
