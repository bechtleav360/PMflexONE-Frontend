import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import { updateBoardColumn, type UpdateBoardColumnInput } from '../api/boardMutationApi'
import { useEditColumnDialogStore } from '../store/boardDialogStores'

/**
 * Mutation hook to update a board column's name. Invalidates the board query and closes the dialog on success.
 * @param boardId - The board the column belongs to.
 * @returns TanStack Mutation result for the update operation.
 */
export function useUpdateBoardColumn(boardId: string) {
  const queryClient = useQueryClient()
  const closeModal = useEditColumnDialogStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (payload: { id: string; input: UpdateBoardColumnInput }) =>
      updateBoardColumn(payload.id, payload.input),
    onSuccess: async () => {
      closeModal()
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
    },
  })
}
