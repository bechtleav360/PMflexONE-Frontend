import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARD_QUERY_KEY, type Board } from '@/entities/work-item'

import { reorderBoardColumns } from '../api/boardMutationApi'

/**
 * Mutation hook to reorder board columns with optimistic update. Rolls back on error.
 * @param boardId - The board whose columns are being reordered.
 * @returns TanStack Mutation result for the reorder operation.
 */
export function useReorderBoardColumns(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (columnIds: string[]) => reorderBoardColumns(boardId, columnIds),
    onMutate: async (columnIds) => {
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
      const previous = queryClient.getQueryData<Board>(BOARD_QUERY_KEY(boardId))
      if (previous) {
        const reordered = [...previous.columns]
          .sort((a, b) => columnIds.indexOf(a.id) - columnIds.indexOf(b.id))
          .map((col, idx) => ({ ...col, position: idx }))
        queryClient.setQueryData(BOARD_QUERY_KEY(boardId), { ...previous, columns: reordered })
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(BOARD_QUERY_KEY(boardId), context.previous)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY(boardId) })
    },
  })
}
