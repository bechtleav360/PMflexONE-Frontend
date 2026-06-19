import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

import type { Label } from '../types/workItem.types'
import { LABELS_QUERY_KEY } from './queryKeys'
import { personSchema } from './workItemApi'

export { LABELS_QUERY_KEY }

// ─── GQL document ────────────────────────────────────────────────────────────

/** GraphQL query document for fetching a filtered list of labels. */
export const GET_LABELS = /* GraphQL */ `
  query Labels($filter: LabelFilter) {
    labels(filter: $filter) {
      id
      version
      name
      color
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
    }
  }
`

// ─── Zod schemas ─────────────────────────────────────────────────────────────

/** Zod schema for a domain label. */
export const labelSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  name: z.string(),
  color: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.string().nullable(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  scope: z.object({ id: z.string(), name: z.string() }).nullable(),
})

/** Zod schema for the `getLabels` query response envelope. */
export const getLabelsResponseSchema = z.object({
  labels: z.array(labelSchema),
})

// ─── API function ─────────────────────────────────────────────────────────────

/**
 * Fetches all labels in a scope.
 * @param filter - Optional filter object.
 * @param filter.scopeId - Optional scope ID to filter labels by.
 * @param filter.scopeType - Optional scope type (project | program | portfolio).
 * @param filter.name - Optional name substring filter.
 * @returns A promise resolving to the labels array.
 */
export async function getLabels(filter?: {
  scopeId?: string
  scopeType?: ScopeType
  name?: string
}): Promise<Label[]> {
  const raw = await graphqlClient.request(GET_LABELS, { filter })
  const parsed = getLabelsResponseSchema.parse(raw)
  return parsed.labels
}
