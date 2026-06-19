import { z } from 'zod'

import { boardSchema } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

import {
  ASSIGN_WORK_ITEM_TO_COLUMN,
  CREATE_BOARD,
  CREATE_BOARD_COLUMN,
  DELETE_BOARD,
  DELETE_BOARD_COLUMN,
  MOVE_WORK_ITEM,
  REMOVE_WORK_ITEM_FROM_COLUMN,
  REORDER_BOARD_COLUMNS,
  UPDATE_BOARD,
  UPDATE_BOARD_COLUMN,
} from './boardMutationGql'

export {
  ASSIGN_WORK_ITEM_TO_COLUMN,
  CREATE_BOARD,
  CREATE_BOARD_COLUMN,
  DELETE_BOARD,
  DELETE_BOARD_COLUMN,
  MOVE_WORK_ITEM,
  REMOVE_WORK_ITEM_FROM_COLUMN,
  REORDER_BOARD_COLUMNS,
  UPDATE_BOARD,
  UPDATE_BOARD_COLUMN,
} from './boardMutationGql'

// ─── Response schemas ─────────────────────────────────────────────────────────

const boardColumnMinSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  workItemStatus: z.string(),
  position: z.number().int(),
  workItems: z.array(
    z.object({
      id: z.string(),
      version: z.number().int(),
      name: z.string(),
      status: z.string(),
      archived: z.boolean(),
    }),
  ),
})

const createBoardMinSchema = boardSchema.omit({ columns: true })
const createBoardResponseSchema = z.object({ createBoard: createBoardMinSchema })
const updateBoardMinSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  columns: z.array(boardColumnMinSchema),
})
const updateBoardResponseSchema = z.object({ updateBoard: updateBoardMinSchema })
const deleteBoardResponseSchema = z.object({ deleteBoard: z.boolean() })
const createColumnResponseSchema = z.object({ createBoardColumn: boardColumnMinSchema })
const updateColumnResponseSchema = z.object({ updateBoardColumn: boardColumnMinSchema })
const deleteColumnResponseSchema = z.object({ deleteBoardColumn: z.boolean() })
const reorderBoardMinSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  columns: z.array(boardColumnMinSchema),
})
const reorderColumnsResponseSchema = z.object({ reorderBoardColumns: reorderBoardMinSchema })
const workItemMutationResultSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  status: z.string(),
})
const assignResponseSchema = z.object({ assignWorkItemToColumn: workItemMutationResultSchema })
const removeFromColumnResponseSchema = z.object({
  removeWorkItemFromColumn: workItemMutationResultSchema,
})

const moveWorkItemPayloadSchema = z.object({
  movedWorkItem: z.object({
    id: z.string(),
    version: z.number().int(),
    status: z.string(),
    position: z.number().int().nullable().optional(),
    boardColumn: z
      .object({
        id: z.string(),
        version: z.number().int(),
        name: z.string(),
        workItemStatus: z.string(),
        position: z.number().int(),
      })
      .nullable()
      .optional(),
  }),
  targetColumn: z.object({ id: z.string(), version: z.number().int() }).nullable().optional(),
  sourceColumn: z.object({ id: z.string(), version: z.number().int() }).nullable().optional(),
})
const moveWorkItemResponseSchema = z.object({ moveWorkItem: moveWorkItemPayloadSchema })

// ─── Input types ──────────────────────────────────────────────────────────────

/** Input for the moveWorkItem mutation. */
export interface MoveWorkItemInput {
  version: number
  /** Target column ID; null or absent = move to active pool. */
  targetColumnId?: string | null
  /** Place after this item; null or absent = place at top. */
  afterWorkItemId?: string | null
}

/** Input for a single column when creating a board. */
export interface CreateBoardColumnInput {
  name: string
  workItemStatus: string
  position: number
}

/** Input for creating a new board with an initial set of columns. */
export interface CreateBoardInput {
  scopeId: string
  scopeType: ScopeType
  name: string
  columns: CreateBoardColumnInput[]
}

/** Input for updating board metadata; all fields except `version` are optional. */
export interface UpdateBoardInput {
  version: number
  name?: string | null
}

/** Input for updating a board column; all fields except `version` are optional. */
export interface UpdateBoardColumnInput {
  version: number
  name?: string | null
  workItemStatus?: string | null
  position?: number | null
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Creates a new board with the given columns.
 * @param input - Board creation payload including scope and initial columns.
 * @returns The created board entity.
 */
export async function createBoard(input: CreateBoardInput) {
  const raw = await graphqlClient.request(CREATE_BOARD, { input })
  return createBoardResponseSchema.parse(raw).createBoard
}

/**
 * Updates a board's metadata.
 * @param id - Board ID.
 * @param input - Fields to update; must include the current `version`.
 * @returns The updated board entity.
 */
export async function updateBoard(id: string, input: UpdateBoardInput) {
  const raw = await graphqlClient.request(UPDATE_BOARD, { id, input })
  return updateBoardResponseSchema.parse(raw).updateBoard
}

/**
 * Deletes a board by ID.
 * @param id - Board ID.
 * @returns `true` when the board was successfully deleted.
 */
export async function deleteBoard(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_BOARD, { id })
  return deleteBoardResponseSchema.parse(raw).deleteBoard
}

/**
 * Creates a new column on an existing board.
 * @param boardId - ID of the parent board.
 * @param input - Column creation payload.
 * @returns The created board column.
 */
export async function createBoardColumn(boardId: string, input: CreateBoardColumnInput) {
  const raw = await graphqlClient.request(CREATE_BOARD_COLUMN, { boardId, input })
  return createColumnResponseSchema.parse(raw).createBoardColumn
}

/**
 * Updates a board column's properties.
 * @param id - Column ID.
 * @param input - Fields to update; must include the current `version`.
 * @returns The updated board column.
 */
export async function updateBoardColumn(id: string, input: UpdateBoardColumnInput) {
  const raw = await graphqlClient.request(UPDATE_BOARD_COLUMN, { id, input })
  return updateColumnResponseSchema.parse(raw).updateBoardColumn
}

/**
 * Deletes a board column by ID.
 * @param id - Column ID.
 * @returns `true` when the column was successfully deleted.
 */
export async function deleteBoardColumn(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_BOARD_COLUMN, { id })
  return deleteColumnResponseSchema.parse(raw).deleteBoardColumn
}

/**
 * Reorders the columns of a board.
 * @param boardId - ID of the board whose columns are being reordered.
 * @param columnIds - Ordered array of column IDs representing the new sequence.
 * @returns The updated board with reordered columns.
 */
export async function reorderBoardColumns(boardId: string, columnIds: string[]) {
  const raw = await graphqlClient.request(REORDER_BOARD_COLUMNS, { boardId, columnIds })
  return reorderColumnsResponseSchema.parse(raw).reorderBoardColumns
}

/**
 * Assigns a work item to a board column.
 * @param workItemId - ID of the work item to assign.
 * @param boardColumnId - ID of the target column.
 * @param version - Current optimistic-concurrency version of the work item.
 * @returns The updated work item with its new column assignment.
 */
export async function assignWorkItemToColumn(
  workItemId: string,
  boardColumnId: string,
  version: number,
) {
  const raw = await graphqlClient.request(ASSIGN_WORK_ITEM_TO_COLUMN, {
    workItemId,
    boardColumnId,
    version,
  })
  return assignResponseSchema.parse(raw).assignWorkItemToColumn
}

/**
 * Removes a work item from its current board column.
 * @param workItemId - ID of the work item to remove.
 * @param version - Current optimistic-concurrency version of the work item.
 * @returns The updated work item with `boardColumn` set to `null`.
 */
export async function removeWorkItemFromColumn(workItemId: string, version: number) {
  const raw = await graphqlClient.request(REMOVE_WORK_ITEM_FROM_COLUMN, { workItemId, version })
  return removeFromColumnResponseSchema.parse(raw).removeWorkItemFromColumn
}

/**
 * Moves a work item within a column, between columns, or to/from the active pool.
 * @param workItemId - ID of the work item to move.
 * @param input - Move parameters: version, optional targetColumnId, optional afterWorkItemId.
 * @returns The move payload with updated work item and affected columns.
 */
export async function moveWorkItem(workItemId: string, input: MoveWorkItemInput) {
  const raw = await graphqlClient.request(MOVE_WORK_ITEM, { workItemId, input })
  return moveWorkItemResponseSchema.parse(raw).moveWorkItem
}
