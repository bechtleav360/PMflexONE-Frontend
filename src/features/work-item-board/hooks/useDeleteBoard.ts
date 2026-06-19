import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY } from '@/entities/work-item'

import { deleteBoard } from '../api/boardMutationApi'

/**
 * Mutation hook to delete a board. Removes the board from cache and invalidates the boards list on success.
 * @returns TanStack Mutation result for the delete operation.
 */
export function useDeleteBoard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBoard(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: BOARD_QUERY_KEY(id) })
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}
