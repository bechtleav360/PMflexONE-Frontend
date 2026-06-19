import { z } from 'zod'

import { STAKEHOLDER_ENTRY_FIELDS, stakeholderEntrySchema } from '@/entities/stakeholder'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { CreateStakeholderInput } from '../utils/stakeholderMappers'

const MUTATION = /* GraphQL */ `
  mutation CreateStakeholderEntry($input: CreateStakeholderEntryInput!) {
    createStakeholderEntry(input: $input) {
      ${STAKEHOLDER_ENTRY_FIELDS}
    }
  }
`

const responseSchema = z.object({
  createStakeholderEntry: stakeholderEntrySchema,
})

/**
 * Sends the `CreateStakeholderEntry` GraphQL mutation and returns the created entry.
 *
 * @param input - All required and optional fields for the new stakeholder entry.
 * @returns The validated stakeholder entry returned by the API.
 */
export async function createStakeholderEntry(input: CreateStakeholderInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createStakeholderEntry
}
