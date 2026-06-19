import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOARDS_QUERY_KEY } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { createBoard, type CreateBoardInput } from '../api/boardMutationApi'
import { useCreateBoardDialogStore } from '../store/boardDialogStores'

/**
 * Mutation hook to create a new board. Invalidates the boards list and closes the dialog on success.
 * @param scopeType - The scope type (e.g. 'Project').
 * @param scopeId - The ID of the scope the board belongs to.
 * @returns TanStack Mutation result for the create operation.
 */
export function useCreateBoard(scopeType: ScopeType, scopeId: string) {
  const queryClient = useQueryClient()
  const closeModal = useCreateBoardDialogStore((s) => s.closeModal)

  return useMutation({
    mutationFn: (payload: { input: CreateBoardInput }) => createBoard(payload.input),
    onSuccess: async () => {
      sessionStorage.setItem('show-sidebar-hint', 'true')
      window.dispatchEvent(new CustomEvent('p1ng:show-sidebar-hint'))
      closeModal()
      await queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY(scopeType, scopeId) })
    },
  })
}
