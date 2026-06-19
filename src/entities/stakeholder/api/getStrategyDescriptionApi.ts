import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

import type { StrategyDescription } from '../types/stakeholder.types'
import { scopeSchema } from './stakeholderSchemasApi'

/** GraphQL document for the `GetStakeholderStrategyDescription` query. */
export const QUERY = /* GraphQL */ `
  query GetStakeholderStrategyDescription($scopeType: ScopeType!, $scopeId: ID!) {
    stakeholderStrategyDescription(scopeType: $scopeType, scopeId: $scopeId) {
      id
      version
      monitor
      keepInformed
      keepSatisfied
      manageClosely
      scope {
        id
        name
        scopeType
      }
      createdAt
      updatedAt
    }
  }
`

/** Zod schema validating the strategy description shape returned from the GraphQL API. */
export const strategyDescriptionSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  monitor: z.string().nullable(),
  keepInformed: z.string().nullable(),
  keepSatisfied: z.string().nullable(),
  manageClosely: z.string().nullable(),
  scope: scopeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

const responseSchema = z.object({
  stakeholderStrategyDescription: strategyDescriptionSchema.nullable(),
})

/**
 * Fetches the strategy description for the given scope from the GraphQL API.
 *
 * @param scopeType - The type of scope to query (Project, Program, Portfolio).
 * @param scopeId - The ID of the scope to query.
 * @returns The validated {@link StrategyDescription}, or `null` if none exists.
 */
export async function getStrategyDescription(
  scopeType: ScopeType,
  scopeId: string,
): Promise<StrategyDescription | null> {
  const raw = await graphqlClient.request(QUERY, { scopeType, scopeId })
  const parsed = responseSchema.parse(raw)
  return parsed.stakeholderStrategyDescription
}
