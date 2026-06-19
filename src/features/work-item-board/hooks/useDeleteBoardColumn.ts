import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BOARD_QUERY_KEY, type Board } from '@/entities/work-item'

import { deleteBoardColumn } from '../api/boardMutationApi'

const BASE_STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE'] as const

/**
 * Mutation hook to delete a board column. Guards against removing base-status coverage before calling the API.
 * @param boardId - The board the column belongs to.
 * @returns TanStack Mutation result for the delete operation.
 */
export function useDeleteBoardColumn(boardId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (columnId: string) => {
      const board = queryClient.getQueryData<Board>(BOARD_QUERY_KEY(boardId))
      if (board) {
        const remaining = board.columns.filter((c) => c.id !== columnId)
        const coveredStatuses = new Set(remaining.map((c) => c.workItemStatus))
        const missing = BASE_STATUSES.filter((s) => !coveredStatuses.has(s))
        if (missing.length > 0) {
          toast.error(t('features.workItem.board.deleteColumnStatusGuard', { status: missing[0] }))
          throw new Error(`Base-status coverage guard: missing ${missing.join(', ')}`)
        }
      }
      return deleteBoardColumn(columnId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
    },
  })
}
