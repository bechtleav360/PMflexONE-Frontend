import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation SubmitProjectCharter($input: SubmitProjectCharterInput!) {
    submitProjectCharter(input: $input) {
      id
      status
      version
      updatedAt
      project {
        id
      }
    }
  }
`

const responseSchema = z.object({
  submitProjectCharter: z.object({
    id: z.string(),
    status: z.string(),
    version: z.number(),
    updatedAt: z.string().nullable(),
    project: z.object({ id: z.string() }).nullable(),
  }),
})

/** Input for the submitProjectCharter mutation. */
export interface SubmitProjectCharterInput {
  id: string
  version: number
}

/**
 * Sends the `submitProjectCharter` lifecycle mutation to the backend.
 * Transitions the charter to `SUBMITTED` state. Validated with Zod at the API boundary.
 *
 * @param input - The charter `id` and current `version` for optimistic concurrency.
 * @returns A promise resolving to the submitted charter (id, status, version, updatedAt, project).
 */
export async function submitProjectCharter(input: SubmitProjectCharterInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.submitProjectCharter
}
