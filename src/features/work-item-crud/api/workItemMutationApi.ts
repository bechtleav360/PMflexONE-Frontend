import { z } from 'zod'

import type { ProjectWorkItem, UpdateProjectWorkItemInput } from '@/entities/work-item'
import { projectWorkItemSchema } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

import type { WorkItemFormValues } from '../utils/workItemFormSchema'
import {
  ARCHIVE_WORK_ITEM,
  CREATE_PROJECT_WORK_ITEM,
  DELETE_PROJECT_WORK_ITEM,
  UNARCHIVE_WORK_ITEM,
} from './workItemMutationDocuments'

export {
  ARCHIVE_WORK_ITEM,
  CREATE_PROJECT_WORK_ITEM,
  DELETE_PROJECT_WORK_ITEM,
  UNARCHIVE_WORK_ITEM,
}

// ─── Response schemas ─────────────────────────────────────────────────────────

const mutationWorkItemSchema = projectWorkItemSchema.omit({ priority: true, labels: true }).extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED']),
  priority: z.string().nullable().optional(),
  labels: z.array(z.unknown()).optional().default([]),
})

const createResponseSchema = z.object({ createProjectWorkItem: mutationWorkItemSchema })
const deleteResponseSchema = z.object({ deleteProjectWorkItem: z.boolean() })
const archiveResponseSchema = z.object({
  archiveWorkItem: z.object({ id: z.string(), version: z.number().int(), archived: z.boolean() }),
})
const unarchiveResponseSchema = z.object({
  unarchiveWorkItem: z.object({ id: z.string(), version: z.number().int(), archived: z.boolean() }),
})

// ─── Input types ──────────────────────────────────────────────────────────────

/** Input for creating a new project work item. */
export interface CreateProjectWorkItemInput {
  scopeId: string
  scopeType: ScopeType
  name: string
  description?: string | null
  dueDate?: string | null
  priority?: string | null
  assigneeId?: string | null
  labelIds?: string[]
  boardColumnId?: string | null
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Sends the `createProjectWorkItem` mutation and returns the created work item.
 *
 * @param input - Fields required to create the work item.
 * @returns The newly created project work item.
 */
export async function createProjectWorkItem(
  input: CreateProjectWorkItemInput,
): Promise<ProjectWorkItem> {
  const seen = new WeakSet()
  const safeInput = JSON.parse(
    JSON.stringify(input, (_k, v) => {
      if (typeof window !== 'undefined' && v === window) return undefined
      if (typeof Node !== 'undefined' && v instanceof Node) return undefined
      if (typeof v === 'object' && v !== null) {
        if (seen.has(v)) return undefined
        seen.add(v)
      }
      return v
    }),
  ) as CreateProjectWorkItemInput
  const raw = await graphqlClient.request(CREATE_PROJECT_WORK_ITEM, { input: safeInput })
  return createResponseSchema.parse(raw).createProjectWorkItem as unknown as ProjectWorkItem
}

/**
 * Sends the `deleteProjectWorkItem` mutation.
 *
 * @param id - ID of the work item to delete.
 * @returns `true` when the deletion was acknowledged by the server.
 */
export async function deleteProjectWorkItem(id: string): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_PROJECT_WORK_ITEM, { id })
  return deleteResponseSchema.parse(raw).deleteProjectWorkItem
}

/**
 * Sends the `archiveWorkItem` mutation.
 *
 * @param id - ID of the work item to archive.
 * @param version - Current optimistic-lock version of the work item.
 * @returns The updated `id`, `version`, and `archived` fields.
 */
export async function archiveWorkItem(
  id: string,
  version: number,
): Promise<{ id: string; version: number; archived: boolean }> {
  const raw = await graphqlClient.request(ARCHIVE_WORK_ITEM, { id, version })
  return archiveResponseSchema.parse(raw).archiveWorkItem
}

/**
 * Sends the `unarchiveWorkItem` mutation.
 *
 * @param id - ID of the work item to unarchive.
 * @param version - Current optimistic-lock version of the work item.
 * @returns The updated `id`, `version`, and `archived` fields.
 */
export async function unarchiveWorkItem(
  id: string,
  version: number,
): Promise<{ id: string; version: number; archived: boolean }> {
  const raw = await graphqlClient.request(UNARCHIVE_WORK_ITEM, { id, version })
  return unarchiveResponseSchema.parse(raw).unarchiveWorkItem
}

// ─── Form value converters ────────────────────────────────────────────────────

/**
 * Converts WorkItemFormValues to CreateProjectWorkItemInput.
 *
 * @param values - Validated form values from the work item form.
 * @param scopeId - ID of the scope to create the work item in.
 * @param scopeType - Type of the scope (e.g. `'project'`).
 * @param boardColumnId - Optional column; backend places the item at position 1 (top).
 * @returns A {@link CreateProjectWorkItemInput} ready to pass to the API.
 */
export function toCreateInput(
  values: WorkItemFormValues,
  scopeId: string,
  scopeType: ScopeType,
  boardColumnId?: string | null,
): CreateProjectWorkItemInput {
  return {
    scopeId,
    scopeType,
    name: values.name.trim(),
    description: values.description ?? null,
    dueDate: values.dueDate ?? null,
    priority: values.priority ?? null,
    assigneeId: values.assigneeId ?? null,
    labelIds: values.labelIds ?? [],
    ...(typeof boardColumnId === 'string' ? { boardColumnId } : {}),
  }
}

const BASE_STATUSES = new Set(['open', 'in_progress', 'done'])

/**
 * Converts WorkItemFormValues to UpdateProjectWorkItemInput.
 * The `status` field is only included when the value is a valid WorkItemBaseStatus
 * (open/in_progress/done). The `rejected` status cannot be set via this mutation.
 *
 * @param values - Validated form values, optionally extended with `status`.
 * @param version - Current optimistic-lock version of the work item.
 * @returns An {@link UpdateProjectWorkItemInput} ready to pass to the API.
 */
export function toUpdateInput(
  values: WorkItemFormValues & { status?: string | null },
  version: number,
): UpdateProjectWorkItemInput {
  const status =
    values.status != null && BASE_STATUSES.has(values.status)
      ? (values.status as 'open' | 'in_progress' | 'done')
      : undefined

  return {
    version,
    name: values.name.trim(),
    description: values.description ?? null,
    ...(status !== undefined ? { status } : {}),
    dueDate: values.dueDate ?? null,
    priority: values.priority ?? null,
    assigneeId: values.assigneeId ?? null,
  }
}
