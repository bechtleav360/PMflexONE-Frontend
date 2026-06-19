import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type {
  Attachment,
  ProjectWorkItem,
  UpdateProjectWorkItemInput,
} from '../types/workItem.types'
import {
  WORK_ITEM_ATTACHMENTS_QUERY_KEY,
  WORK_ITEM_QUERY_KEY,
  WORK_ITEMS_QUERY_KEY,
} from './queryKeys'
import { UPDATE_PROJECT_WORK_ITEM } from './workItemMutationDocuments'
import {
  GET_WORK_ITEM,
  GET_WORK_ITEM_ATTACHMENTS,
  GET_WORK_ITEM_ATTACHMENTS_SAFE,
  GET_WORK_ITEMS,
} from './workItemQueries'

export { WORK_ITEMS_QUERY_KEY, WORK_ITEM_QUERY_KEY, WORK_ITEM_ATTACHMENTS_QUERY_KEY }

export { UPDATE_PROJECT_WORK_ITEM } from './workItemMutationDocuments'

export {
  GET_WORK_ITEMS,
  GET_WORK_ITEM,
  GET_WORK_ITEM_ATTACHMENTS,
  GET_WORK_ITEM_ATTACHMENTS_SAFE,
} from './workItemQueries'

// ─── Zod schemas ─────────────────────────────────────────────────────────────

/** Zod schema for a person reference (creator, updater, assignee, author). */
export const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string().nullable().optional(),
})

const scopeSchema = z.object({ id: z.string(), name: z.string() })

const boardColumnRefSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  workItemStatus: z.string(),
  position: z.number().int(),
  board: z.object({ id: z.string(), name: z.string() }).optional(),
})

const labelRefSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  color: z.string().nullable(),
})

/** Zod schema for the base work item fields returned by list and detail queries. */
export const workItemBaseSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  dueDate: z.string().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).nullable().optional(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  assignee: personSchema.nullable(),
  labels: z.array(labelRefSchema).optional(),
  scope: scopeSchema.nullable(),
  boardColumn: boardColumnRefSchema.nullable().optional(),
  position: z.number().int().nullable().optional(),
})

/** Zod schema for a project work item — narrows status to the project-specific enum. */
export const projectWorkItemSchema = z.object({
  ...workItemBaseSchema.shape,
  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED']),
})

/** Zod schema for the `getWorkItems` query response envelope. */
export const getWorkItemsResponseSchema = z.object({
  workItems: z.array(projectWorkItemSchema),
})

const attachmentSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  fileName: z.string().nullable(),
  storageKey: z.string().nullable(),
  size: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable().optional(),
  creator: personSchema.nullable(),
})

const commentSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable(),
  creator: personSchema,
  attachments: z.array(attachmentSchema),
})

const workItemLinkNodeSchema = z.object({
  edgeTypeName: z.string().nullable(),
  metadata: z.string().nullable(),
  item: workItemBaseSchema.nullable(),
})

const workItemDetailSchema = z.object({
  ...workItemBaseSchema.shape,
  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED']),
  comments: z.array(commentSchema),
  links: z.array(workItemLinkNodeSchema),
})

/** Zod schema for the `getWorkItem` query response envelope. */
export const getWorkItemResponseSchema = z.object({
  workItem: workItemDetailSchema.nullable(),
})

/** Zod schema for the `getWorkItemAttachments` query response envelope. */
export const getWorkItemAttachmentsResponseSchema = z.object({
  workItem: z.object({ attachments: z.array(attachmentSchema) }).nullable(),
})

/** Safe variant — omits fileName/storageKey/size (non-null in schema, null while PENDING).
 *  Includes metadata so the frontend can recover fileName stored there at upload time. */
const attachmentSafeSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  metadata: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
})

const getWorkItemAttachmentsSafeResponseSchema = z.object({
  workItem: z.object({ attachments: z.array(attachmentSafeSchema) }).nullable(),
})

// ─── Mutation schemas ─────────────────────────────────────────────────────────

const updateResponseSchema = z.object({ updateProjectWorkItem: projectWorkItemSchema })

// ─── API functions ────────────────────────────────────────────────────────────

/** Optional filter parameters accepted by the `workItems` query. */
export interface WorkItemFilter {
  id?: string
  name?: string
  status?: string
  priority?: string
  archived?: boolean
  assigneeId?: string
  labelId?: string
  scopeId?: string
  createdAtFrom?: string
  createdAtTo?: string
  updatedAtFrom?: string
  updatedAtTo?: string
}

/**
 * Fetches a filtered list of work items from the backend.
 * @param filter - Optional filter parameters.
 * @returns A promise resolving to the work item array.
 */
export async function getWorkItems(filter?: WorkItemFilter): Promise<ProjectWorkItem[]> {
  const raw = await graphqlClient.request(GET_WORK_ITEMS, { filter })
  const parsed = getWorkItemsResponseSchema.parse(raw)
  return parsed.workItems
}

/**
 * Fetches a single work item by ID including comments and links (no attachments).
 * @param id - The work item ID.
 * @returns A promise resolving to the work item or null.
 */
export async function getWorkItem(id: string): Promise<ProjectWorkItem | null> {
  const raw = await graphqlClient.request(GET_WORK_ITEM, { id })
  const result = getWorkItemResponseSchema.safeParse(raw)
  if (!result.success) throw result.error
  return result.data.workItem
}

/**
 * Fetches only the enriched attachments for a work item (includes fileName / storageKey / size).
 * Throws when any attachment field declared non-null in the backend schema is still null
 * (pending asset enrichment) — the caller should fall back to {@link getWorkItemAttachmentsSafe}.
 * @param id - The work item ID.
 * @returns Array of fully-enriched attachments.
 */
export async function getWorkItemAttachments(id: string): Promise<Attachment[]> {
  const raw = await graphqlClient.request(GET_WORK_ITEM_ATTACHMENTS, { id })
  const result = getWorkItemAttachmentsResponseSchema.safeParse(raw)
  if (!result.success) throw result.error
  if (!result.data.workItem)
    throw new Error('workItem null — NullValueInNonNullableField propagation')
  return result.data.workItem.attachments
}

/**
 * Fetches only the attachment IDs / timestamps without the enrichment-dependent fields
 * (fileName, storageKey, size).  Safe to call while attachments are still in PENDING state
 * — returns placeholder records that the UI displays as "Processing…".
 * @param id - The work item ID.
 * @returns Array of attachment records with synthesized fileName and storageKey fields.
 */
export async function getWorkItemAttachmentsSafe(id: string): Promise<Attachment[]> {
  const raw = await graphqlClient.request(GET_WORK_ITEM_ATTACHMENTS_SAFE, { id })
  const result = getWorkItemAttachmentsSafeResponseSchema.safeParse(raw)
  if (!result.success) throw result.error
  if (!result.data.workItem) throw new Error('workItem null in safe attachments query')
  return result.data.workItem.attachments.map((a): Attachment => {
    // Recover fileName from the metadata JSON stored at upload time.
    let fileName: string | null = null
    if (a.metadata) {
      try {
        const meta = JSON.parse(a.metadata) as Record<string, unknown>
        if (typeof meta.fileName === 'string') fileName = meta.fileName
      } catch {
        /* malformed metadata — leave fileName null */
      }
    }
    // Derive the content URL from the attachment ID — mirrors the upload endpoint path.
    // This works without backend enrichment because the ID is known at creation time.
    const storageKey = `/api/assets/${a.id}/content`
    return { ...a, fileName, storageKey, size: null }
  })
}

/**
 * Sends the `updateProjectWorkItem` mutation and returns the updated work item.
 *
 * @param id - ID of the work item to update.
 * @param input - Fields to update; must include the current `version`.
 * @returns The updated project work item.
 */
export async function updateProjectWorkItem(
  id: string,
  input: UpdateProjectWorkItemInput,
): Promise<ProjectWorkItem> {
  const raw = await graphqlClient.request(UPDATE_PROJECT_WORK_ITEM, { id, input })
  return updateResponseSchema.parse(raw).updateProjectWorkItem
}
