import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation DeleteStakeholderEntry($input: DeleteStakeholderEntryInput!) {
    deleteStakeholderEntry(input: $input)
  }
`

const responseSchema = z.object({
  deleteStakeholderEntry: z.boolean(),
})

/** Input required by the `DeleteStakeholderEntry` mutation. */
export interface DeleteStakeholderEntryInput {
  id: string
  version: number
}

/**
 * Sends the `DeleteStakeholderEntry` GraphQL mutation.
 *
 * @param input - The entry ID and version for optimistic locking.
 * @returns `true` when the deletion was successful.
 */
export async function deleteStakeholderEntry(input: DeleteStakeholderEntryInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.deleteStakeholderEntry
}
