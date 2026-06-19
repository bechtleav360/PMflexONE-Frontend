import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BOARD_CACHE_PREFIX,
  updateProjectWorkItem,
  WORK_ITEM_QUERY_KEY,
} from '@/entities/work-item'

/**
 * Lightweight mutation hook for assigning or unassigning a person on a board card.
 * Does not touch any dialog store — suitable for inline board interactions.
 * @returns A TanStack Query mutation object for assigning or unassigning a person.
 */
export function useAssignWorkItemPerson() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: { id: string; version: number; assigneeId: string | null }) =>
      updateProjectWorkItem(payload.id, {
        version: payload.version,
        assigneeId: payload.assigneeId,
      }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: WORK_ITEM_QUERY_KEY(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['workItems'] }),
        queryClient.invalidateQueries({ queryKey: BOARD_CACHE_PREFIX }),
      ])
    },
    onError: () => {
      toast.error(
        t(
          'features.workItem.board.assigneeSaveError',
          'Could not update assignee. Please try again.',
        ),
      )
    },
  })
}
