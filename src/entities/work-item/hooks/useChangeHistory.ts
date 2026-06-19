import { useQuery } from '@tanstack/react-query'

import {
  CHANGE_HISTORY_QUERY_KEY,
  getBoardChangeHistory,
  getBoardColumnChangeHistory,
  getCommentChangeHistory,
  getLabelChangeHistory,
  getWorkItemChangeHistory,
} from '../api/changeHistoryApi'
import type { ChangeHistoryEntry as WorkItemChangeHistoryEntry } from '../types/workItem.types'

/**
 * Lazily fetches the change history for a work item.
 * Only fires the query when `isOpen` is true.
 *
 * @param workItemId - The work item ID.
 * @param isOpen - Whether the history panel is open.
 * @returns TanStack Query result containing the change history entries.
 */
export function useWorkItemChangeHistory(workItemId: string, isOpen: boolean) {
  return useQuery<WorkItemChangeHistoryEntry[]>({
    queryKey: CHANGE_HISTORY_QUERY_KEY('workItem', workItemId),
    queryFn: () => getWorkItemChangeHistory(workItemId),
    enabled: isOpen && Boolean(workItemId),
    staleTime: 0,
  })
}

/**
 * Lazily fetches the change history for a board.
 *
 * @param boardId - The board ID.
 * @param isOpen - Whether the history panel is open.
 * @returns TanStack Query result containing the change history entries.
 */
export function useBoardChangeHistory(boardId: string, isOpen: boolean) {
  return useQuery<WorkItemChangeHistoryEntry[]>({
    queryKey: CHANGE_HISTORY_QUERY_KEY('board', boardId),
    queryFn: () => getBoardChangeHistory(boardId),
    enabled: isOpen && Boolean(boardId),
    staleTime: 0,
  })
}

/**
 * Lazily fetches the change history for a board column.
 *
 * @param boardColumnId - The board column ID.
 * @param isOpen - Whether the history panel is open.
 * @returns TanStack Query result containing the change history entries.
 */
export function useBoardColumnChangeHistory(boardColumnId: string, isOpen: boolean) {
  return useQuery<WorkItemChangeHistoryEntry[]>({
    queryKey: CHANGE_HISTORY_QUERY_KEY('boardColumn', boardColumnId),
    queryFn: () => getBoardColumnChangeHistory(boardColumnId),
    enabled: isOpen && Boolean(boardColumnId),
    staleTime: 0,
  })
}

/**
 * Lazily fetches the change history for a comment.
 *
 * @param commentId - The comment ID.
 * @param isOpen - Whether the history panel is open.
 * @returns TanStack Query result containing the change history entries.
 */
export function useCommentChangeHistory(commentId: string, isOpen: boolean) {
  return useQuery<WorkItemChangeHistoryEntry[]>({
    queryKey: CHANGE_HISTORY_QUERY_KEY('comment', commentId),
    queryFn: () => getCommentChangeHistory(commentId),
    enabled: isOpen && Boolean(commentId),
    staleTime: 0,
  })
}

/**
 * Lazily fetches the change history for a label.
 *
 * @param labelId - The label ID.
 * @param isOpen - Whether the history panel is open.
 * @returns TanStack Query result containing the change history entries.
 */
export function useLabelChangeHistory(labelId: string, isOpen: boolean) {
  return useQuery<WorkItemChangeHistoryEntry[]>({
    queryKey: CHANGE_HISTORY_QUERY_KEY('label', labelId),
    queryFn: () => getLabelChangeHistory(labelId),
    enabled: isOpen && Boolean(labelId),
    staleTime: 0,
  })
}
