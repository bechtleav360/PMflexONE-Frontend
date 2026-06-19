import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import { updateBoard, type UpdateBoardInput } from '../api/boardMutationApi'
import { useEditBoardDialogStore } from '../store/boardDialogStores'

/**
 * Mutation hook to update a board's name. Invalidates the board query and closes the dialog on success.
 * @returns TanStack Mutation result for the update operation.
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient()
  const closeModal = useEditBoardDialogStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (payload: { id: string; input: UpdateBoardInput }) =>
      updateBoard(payload.id, payload.input),
    onSuccess: async (_, variables) => {
      closeModal()
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(variables.id) })
    },
  })
}
