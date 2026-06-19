import { z } from 'zod'

import type { StrategyDescription } from '@/entities/stakeholder'
import { strategyDescriptionSchema } from '@/entities/stakeholder'
import { graphqlClient } from '@/shared/lib/graphqlClient'
import type { ScopeType } from '@/shared/types/scopeType'

const MUTATION = /* GraphQL */ `
  mutation UpsertStakeholderStrategyDescription($input: UpsertStakeholderStrategyDescription!) {
    upsertStakeholderStrategyDescription(input: $input) {
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

const responseSchema = z.object({
  upsertStakeholderStrategyDescription: strategyDescriptionSchema,
})

/** Per-quadrant text fields for the strategy description upsert mutation. */
export interface UpsertStrategyDescriptionInput {
  monitor?: string | null
  keepInformed?: string | null
  keepSatisfied?: string | null
  manageClosely?: string | null
}

/**
 * Sends the `UpsertStakeholderStrategyDescription` GraphQL mutation.
 *
 * Creates the strategy description if it does not exist yet, or updates it otherwise.
 *
 * @param scopeType - The type of scope the strategy description belongs to.
 * @param scopeId - The ID of the scope.
 * @param input - Per-quadrant text values to persist.
 * @returns The validated {@link StrategyDescription} returned by the API.
 */
export async function upsertStrategyDescription(
  scopeType: ScopeType,
  scopeId: string,
  input: UpsertStrategyDescriptionInput,
): Promise<StrategyDescription> {
  const raw = await graphqlClient.request(MUTATION, {
    input: { scopeType, scopeId, ...input },
  })
  const parsed = responseSchema.parse(raw)
  return parsed.upsertStakeholderStrategyDescription as StrategyDescription
}
