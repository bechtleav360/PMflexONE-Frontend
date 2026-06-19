import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { ChangeHistoryEntry } from '../types/workItem.types'
import { CHANGE_HISTORY_QUERY_KEY } from './queryKeys'
import { personSchema } from './workItemApi'

export { CHANGE_HISTORY_QUERY_KEY }

// ─── GQL documents ───────────────────────────────────────────────────────────

const HISTORY_FIELDS = /* GraphQL */ `
  fragment HistoryFields on ChangeHistoryEntry {
    id
    entityId
    changedField
    oldValue
    newValue
    changedAt
    changedBy {
      id
      firstName
      lastName
      mail
    }
  }
`

/** GraphQL query document for fetching the change history of a work item. */
export const WORK_ITEM_CHANGE_HISTORY = /* GraphQL */ `
  ${HISTORY_FIELDS}
  query WorkItemChangeHistory($workItemId: ID!) {
    workItemChangeHistory(workItemId: $workItemId) {
      ...HistoryFields
    }
  }
`

/** GraphQL query document for fetching the change history of a board. */
export const BOARD_CHANGE_HISTORY = /* GraphQL */ `
  ${HISTORY_FIELDS}
  query BoardChangeHistory($boardId: ID!) {
    boardChangeHistory(boardId: $boardId) {
      ...HistoryFields
    }
  }
`

/** GraphQL query document for fetching the change history of a board column. */
export const BOARD_COLUMN_CHANGE_HISTORY = /* GraphQL */ `
  ${HISTORY_FIELDS}
  query BoardColumnChangeHistory($boardColumnId: ID!) {
    boardColumnChangeHistory(boardColumnId: $boardColumnId) {
      ...HistoryFields
    }
  }
`

/** GraphQL query document for fetching the change history of a comment. */
export const COMMENT_CHANGE_HISTORY = /* GraphQL */ `
  ${HISTORY_FIELDS}
  query CommentChangeHistory($commentId: ID!) {
    commentChangeHistory(commentId: $commentId) {
      ...HistoryFields
    }
  }
`

/** GraphQL query document for fetching the change history of a label. */
export const LABEL_CHANGE_HISTORY = /* GraphQL */ `
  ${HISTORY_FIELDS}
  query LabelChangeHistory($labelId: ID!) {
    labelChangeHistory(labelId: $labelId) {
      ...HistoryFields
    }
  }
`

// ─── Zod schemas ─────────────────────────────────────────────────────────────

/** Zod schema for a single change history entry returned by the GraphQL API. */
export const changeHistoryEntrySchema = z.object({
  id: z.string(),
  entityId: z.string(),
  changedField: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  changedAt: z.string(),
  changedBy: personSchema.nullable(),
})

const historyResponseSchema = (key: string) =>
  z.object({ [key]: z.array(changeHistoryEntrySchema).nullable().catch([]) })

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetches the change history for a work item.
 *
 * @param workItemId - ID of the work item.
 * @returns Ordered list of change history entries for the work item.
 */
export async function getWorkItemChangeHistory(workItemId: string): Promise<ChangeHistoryEntry[]> {
  const raw = await graphqlClient.request(WORK_ITEM_CHANGE_HISTORY, { workItemId })
  return historyResponseSchema('workItemChangeHistory').parse(raw).workItemChangeHistory ?? []
}

/**
 * Fetches the change history for a board.
 *
 * @param boardId - ID of the board.
 * @returns Ordered list of change history entries for the board.
 */
export async function getBoardChangeHistory(boardId: string): Promise<ChangeHistoryEntry[]> {
  const raw = await graphqlClient.request(BOARD_CHANGE_HISTORY, { boardId })
  return historyResponseSchema('boardChangeHistory').parse(raw).boardChangeHistory ?? []
}

/**
 * Fetches the change history for a board column.
 *
 * @param boardColumnId - ID of the board column.
 * @returns Ordered list of change history entries for the board column.
 */
export async function getBoardColumnChangeHistory(
  boardColumnId: string,
): Promise<ChangeHistoryEntry[]> {
  const raw = await graphqlClient.request(BOARD_COLUMN_CHANGE_HISTORY, { boardColumnId })
  return historyResponseSchema('boardColumnChangeHistory').parse(raw).boardColumnChangeHistory ?? []
}

/**
 * Fetches the change history for a comment.
 *
 * @param commentId - ID of the comment.
 * @returns Ordered list of change history entries for the comment.
 */
export async function getCommentChangeHistory(commentId: string): Promise<ChangeHistoryEntry[]> {
  const raw = await graphqlClient.request(COMMENT_CHANGE_HISTORY, { commentId })
  return historyResponseSchema('commentChangeHistory').parse(raw).commentChangeHistory ?? []
}

/**
 * Fetches the change history for a label.
 *
 * @param labelId - ID of the label.
 * @returns Ordered list of change history entries for the label.
 */
export async function getLabelChangeHistory(labelId: string): Promise<ChangeHistoryEntry[]> {
  const raw = await graphqlClient.request(LABEL_CHANGE_HISTORY, { labelId })
  return historyResponseSchema('labelChangeHistory').parse(raw).labelChangeHistory ?? []
}
