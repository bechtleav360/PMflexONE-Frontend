import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Board } from '../types/workItem.types'
import { BOARD_QUERY_KEY, BOARDS_QUERY_KEY } from './queryKeys'
import { personSchema, projectWorkItemSchema } from './workItemApi'

export { BOARDS_QUERY_KEY, BOARD_QUERY_KEY }

// ─── GQL documents ───────────────────────────────────────────────────────────

/** GraphQL query document for fetching a filtered list of boards. */
export const GET_BOARDS = /* GraphQL */ `
  query Boards($filter: BoardFilter) {
    boards(filter: $filter) {
      id
      version
      name
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      scope {
        id
        name
      }
      columns {
        id
        version
        name
        workItemStatus
        position
        createdAt
        updatedAt
      }
    }
  }
`

/** GraphQL query document for fetching a single board by ID including its columns and work items. */
export const GET_BOARD = /* GraphQL */ `
  query Board($id: ID!) {
    board(id: $id) {
      id
      version
      name
      createdAt
      updatedAt
      metadata
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      scope {
        id
        name
      }
      columns {
        id
        version
        name
        workItemStatus
        position
        createdAt
        updatedAt
        workItems {
          id
          version
          name
          description
          status
          dueDate
          priority
          archived
          createdAt
          updatedAt
          metadata
          creator {
            id
            firstName
            lastName
            mail
          }
          updater {
            id
            firstName
            lastName
            mail
          }
          assignee {
            id
            firstName
            lastName
            mail
          }
          labels {
            id
            version
            name
            color
          }
          scope {
            id
            name
          }
          position
        }
      }
    }
  }
`

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const boardColumnSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  workItemStatus: z.string(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const boardColumnWithItemsSchema = boardColumnSchema.extend({
  workItems: z
    .array(projectWorkItemSchema.extend({ position: z.number().int().nullable().optional() }))
    .nullable()
    .transform((v) => v ?? []),
})

/** Zod schema for a board summary (no work item data in columns). */
export const boardSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  scope: z.object({ id: z.string(), name: z.string() }).nullable(),
  columns: z.array(boardColumnSchema),
})

const boardDetailSchema = boardSchema.extend({
  columns: z.array(boardColumnWithItemsSchema),
})

/** Zod schema for the `getBoards` query response envelope. */
export const getBoardsResponseSchema = z.object({
  boards: z.array(boardSchema),
})

/** Zod schema for the `getBoard` query response envelope. */
export const getBoardResponseSchema = z.object({
  board: boardDetailSchema.nullable(),
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetches all boards in a scope.
 * @param filter - Optional filter object.
 * @param filter.scopeId - Optional scope ID to filter boards by.
 * @param filter.name - Optional name substring filter.
 * @returns A promise resolving to the boards array.
 */
export async function getBoards(filter?: { scopeId?: string; name?: string }): Promise<Board[]> {
  const raw = await graphqlClient.request(GET_BOARDS, { filter })
  const parsed = getBoardsResponseSchema.parse(raw)
  return parsed.boards
}

/**
 * Fetches a single board by ID including its columns and their work items.
 * @param id - The board ID.
 * @returns A promise resolving to the board or null.
 */
export async function getBoard(id: string): Promise<Board | null> {
  const raw = await graphqlClient.request(GET_BOARD, { id })
  const parsed = getBoardResponseSchema.parse(raw)
  return parsed.board
}
