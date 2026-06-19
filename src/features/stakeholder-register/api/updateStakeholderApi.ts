import { z } from 'zod'

import { STAKEHOLDER_ENTRY_FIELDS, stakeholderEntrySchema } from '@/entities/stakeholder'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { UpdateStakeholderInput } from '../utils/stakeholderMappers'

const MUTATION = /* GraphQL */ `
  mutation UpdateStakeholderEntry($id: ID!, $input: UpdateStakeholderEntryInput!) {
    updateStakeholderEntry(id: $id, input: $input) {
      ${STAKEHOLDER_ENTRY_FIELDS}
    }
  }
`

const responseSchema = z.object({
  updateStakeholderEntry: stakeholderEntrySchema,
})

/** Arguments required by the `UpdateStakeholderEntry` mutation. */
export interface UpdateStakeholderArgs {
  id: string
  version: number
  input: UpdateStakeholderInput
  scopeType: string
  scopeId: string
}

/**
 * Sends the `UpdateStakeholderEntry` GraphQL mutation and returns the updated entry.
 *
 * Includes the `version` field for optimistic locking.
 *
 * @param args - The entry ID, version, and field-level update input.
 * @returns The validated stakeholder entry returned by the API.
 */
export async function updateStakeholderEntry(args: UpdateStakeholderArgs) {
  const { id, version, input } = args
  const raw = await graphqlClient.request(MUTATION, { id, input: { ...input, version } })
  const parsed = responseSchema.parse(raw)
  return parsed.updateStakeholderEntry
}
