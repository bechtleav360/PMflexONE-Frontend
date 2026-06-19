import type { ScopeType } from '@/shared/types/scopeType'

/**
 * TanStack Query cache key for a scoped work items list.
 *
 * Scoped by scopeType + scopeId to allow precise cache invalidation.
 *
 * @param scopeType - Type of the scope (e.g. `'Project'`).
 * @param scopeId - ID of the scope.
 * @returns Readonly cache key tuple.
 */
export const WORK_ITEMS_QUERY_KEY = (scopeType: ScopeType, scopeId: string) =>
  ['workItems', scopeType, scopeId] as const

/**
 * TanStack Query cache key for a single work item.
 *
 * @param id - Work item ID.
 * @returns Readonly cache key tuple.
 */
export const WORK_ITEM_QUERY_KEY = (id: string) => ['workItem', id] as const

/**
 * TanStack Query cache key for a work item's attachments (separate from the main work-item query
 * so that attachment enrichment errors never blank out the rest of the detail panel).
 *
 * @param id - Work item ID.
 * @returns Readonly cache key tuple.
 */
export const WORK_ITEM_ATTACHMENTS_QUERY_KEY = (id: string) => ['workItemAttachments', id] as const

/**
 * TanStack Query cache key for a scoped boards list.
 *
 * @param scopeType - Type of the scope (e.g. `'Project'`).
 * @param scopeId - ID of the scope.
 * @returns Readonly cache key tuple.
 */
export const BOARDS_QUERY_KEY = (scopeType: ScopeType, scopeId: string) =>
  ['boards', scopeType, scopeId] as const

/** Cache key prefix shared by all board queries — use for broad invalidation. */
export const BOARD_CACHE_PREFIX = ['board'] as const

/**
 * TanStack Query cache key for a single board.
 *
 * @param id - Board ID.
 * @returns Readonly cache key tuple.
 */
export const BOARD_QUERY_KEY = (id: string) => [...BOARD_CACHE_PREFIX, id] as const

/**
 * TanStack Query cache key for a scoped labels list.
 *
 * @param scopeType - Type of the scope (e.g. `'Project'`).
 * @param scopeId - ID of the scope.
 * @returns Readonly cache key tuple.
 */
export const LABELS_QUERY_KEY = (scopeType: ScopeType, scopeId: string) =>
  ['labels', scopeType, scopeId] as const

/**
 * TanStack Query cache key for the comments of a work item.
 *
 * @param workItemId - Work item ID.
 * @returns Readonly cache key tuple.
 */
export const COMMENTS_QUERY_KEY = (workItemId: string) => ['comments', workItemId] as const

/**
 * TanStack Query cache key for the change history of any tracked entity.
 *
 * @param entityType - The entity type string (e.g. `'workItem'`, `'board'`).
 * @param id - ID of the entity.
 * @returns Readonly cache key tuple.
 */
export const CHANGE_HISTORY_QUERY_KEY = (entityType: string, id: string) =>
  ['changeHistory', entityType, id] as const

/**
 * TanStack Query cache key for a named lookup list.
 *
 * @param name - Lookup name (e.g. `'workItemBaseStatus'`).
 * @returns Readonly cache key tuple.
 */
export const LOOKUPS_QUERY_KEY = (name: string) => ['lookups', name] as const
