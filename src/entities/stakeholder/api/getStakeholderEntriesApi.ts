import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

import type { StakeholderEntry } from '../types/stakeholder.types'
import { STAKEHOLDER_ENTRY_FIELDS, stakeholderEntrySchema } from './stakeholderSchemasApi'

/** GraphQL document for the `GetStakeholderEntries` query. */
export const QUERY = /* GraphQL */ `
  query GetStakeholderEntries($filter: StakeholderEntryFilter) {
    stakeholderEntries(filter: $filter) {
      ${STAKEHOLDER_ENTRY_FIELDS}
      logs {
        id
        version
        date
        content
        createdAt
        updatedAt
      }
    }
  }
`

const stakeholderLogSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  date: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const entryWithLogsSchema = stakeholderEntrySchema.extend({
  logs: z.array(stakeholderLogSchema).default([]),
})

const responseSchema = z.object({
  stakeholderEntries: z.array(entryWithLogsSchema),
})

/**
 * Fetches all stakeholder entries for the given scope from the GraphQL API.
 *
 * @param scopeType - The type of scope to query (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope to query.
 * @returns An array of validated {@link StakeholderEntry} objects.
 */
export async function getStakeholderEntries(
  scopeType: ScopeType,
  scopeId: string,
): Promise<StakeholderEntry[]> {
  const raw = await graphqlClient.request(QUERY, { filter: { scopeType, scopeId } })
  const parsed = responseSchema.parse(raw)
  return parsed.stakeholderEntries
}
