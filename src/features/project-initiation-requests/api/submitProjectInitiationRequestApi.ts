import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation SubmitProjectInitiationRequest($id: ID!, $version: Int!) {
    submitProjectInitiationRequest(id: $id, version: $version) {
      id
      version
      name
      status
      updatedAt
    }
  }
`

const responseSchema = z.object({
  submitProjectInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    status: z.string().nullable(),
    updatedAt: z.string(),
  }),
})

/**
 * Calls the `submitProjectInitiationRequest` lifecycle mutation.
 * Transitions the request from `draft` → `submitted` (auto-accepted in MVP).
 * The `version` argument enforces optimistic concurrency control.
 *
 * @param id - The PIR identifier.
 * @param version - Current optimistic lock version from the server.
 * @returns A promise resolving to the updated PIR fields.
 */
export async function submitProjectInitiationRequest(id: string, version: number) {
  const raw = await graphqlClient.request(MUTATION, { id, version })
  const parsed = responseSchema.parse(raw)
  return parsed.submitProjectInitiationRequest
}
