import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { StatusLookup } from '../types/workItem.types'
import { LOOKUPS_QUERY_KEY } from './queryKeys'

export { LOOKUPS_QUERY_KEY }

// ─── GQL documents ───────────────────────────────────────────────────────────

/** GraphQL query for fetching base work item status lookup values. */
export const GET_LOOKUP_WORK_ITEM_BASE_STATUS = /* GraphQL */ `
  query LookupWorkItemBaseStatus {
    lookupWorkItemBaseStatus {
      value
      label
    }
  }
`

/** GraphQL query for fetching project-specific work item status lookup values. */
export const GET_LOOKUP_PROJECT_WORK_ITEM_STATUS = /* GraphQL */ `
  query LookupProjectWorkItemStatus {
    lookupProjectWorkItemStatus {
      value
      label
    }
  }
`

/** GraphQL query for fetching work item priority lookup values. */
export const GET_LOOKUP_WORK_ITEM_PRIORITY = /* GraphQL */ `
  query LookupWorkItemPriority {
    lookupWorkItemPriority {
      value
      label
    }
  }
`

// ─── Zod schemas ─────────────────────────────────────────────────────────────

/** Zod schema for a single status or priority lookup entry. */
export const statusLookupSchema = z.object({
  value: z.string(),
  label: z.string(),
})

/** Zod schema for a response containing an array of lookup items. */
export const getLookupsResponseSchema = z.object({
  items: z.array(statusLookupSchema),
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetches display labels for all WorkItemBaseStatus values.
 * Cached indefinitely — call once at page/app level.
 * @returns Array of status lookup entries.
 */
export async function getWorkItemBaseStatusLookup(): Promise<StatusLookup[]> {
  const raw = await graphqlClient.request(GET_LOOKUP_WORK_ITEM_BASE_STATUS)
  return z.object({ lookupWorkItemBaseStatus: z.array(statusLookupSchema) }).parse(raw)
    .lookupWorkItemBaseStatus
}

/**
 * Fetches display labels for all ProjectWorkItemStatus values.
 * Cached indefinitely — call once at page/app level.
 * @returns Array of status lookup entries.
 */
export async function getProjectWorkItemStatusLookup(): Promise<StatusLookup[]> {
  const raw = await graphqlClient.request(GET_LOOKUP_PROJECT_WORK_ITEM_STATUS)
  return z.object({ lookupProjectWorkItemStatus: z.array(statusLookupSchema) }).parse(raw)
    .lookupProjectWorkItemStatus
}

/**
 * Fetches display labels for all WorkItemPriority values.
 * Cached indefinitely — call once at page/app level.
 * @returns Array of priority lookup entries.
 */
export async function getWorkItemPriorityLookup(): Promise<StatusLookup[]> {
  const raw = await graphqlClient.request(GET_LOOKUP_WORK_ITEM_PRIORITY)
  return z.object({ lookupWorkItemPriority: z.array(statusLookupSchema) }).parse(raw)
    .lookupWorkItemPriority
}
