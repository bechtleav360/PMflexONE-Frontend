import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import { createBoardColumn, type CreateBoardColumnInput } from '../api/boardMutationApi'
import { useCreateColumnDialogStore } from '../store/boardDialogStores'

const COLUMN_SOFT_LIMIT = 15

/**
 * Mutation hook to create a new column on a board. Enforces a soft column limit and invalidates the board query on success.
 * @param boardId - The ID of the board to add the column to.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateBoardColumn(boardId: string) {
  const queryClient = useQueryClient()
  const closeModal = useCreateColumnDialogStore((s) => s.closeModal)
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: CreateBoardColumnInput) => createBoardColumn(boardId, input),
    onSuccess: async () => {
      closeModal()
      toast.success(t('features.workItem.board.columnCreated'))
      const data = queryClient.getQueryData<{ columns?: unknown[] }>(BOARD_QUERY_KEY(boardId))
      if (data?.columns && data.columns.length >= COLUMN_SOFT_LIMIT) {
        toast.warning(
          t('features.workItem.board.columnSoftLimitWarning', { count: data.columns.length }),
        )
      }
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}
