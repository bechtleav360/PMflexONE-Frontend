import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import { updateBoardColumn, type UpdateBoardColumnInput } from '../api/boardMutationApi'

/**
 * Inline rename mutation for a board column — does not touch any dialog store.
 * @param boardId - ID of the board the column belongs to.
 * @returns A TanStack Query mutation object for renaming the column in place.
 */
export function useUpdateBoardColumnInline(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: string; input: UpdateBoardColumnInput }) =>
      updateBoardColumn(payload.id, payload.input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
    },
  })
}
