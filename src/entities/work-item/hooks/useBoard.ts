import { useQuery } from '@tanstack/react-query'

import { BOARD_QUERY_KEY, getBoard } from '../api/boardApi'
import type { Board } from '../types/workItem.types'

/**
 * Fetches a single board by ID including its columns and work items.
 *
 * @param id - The board ID.
 * @returns A TanStack Query result containing the board or null.
 */
export function useBoard(id: string) {
  return useQuery<Board | null>({
    queryKey: BOARD_QUERY_KEY(id),
    queryFn: () => getBoard(id),
    staleTime: 0,
    enabled: Boolean(id),
  })
}
