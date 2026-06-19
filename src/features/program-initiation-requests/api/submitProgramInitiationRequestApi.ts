import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation SubmitProgramInitiationRequest($id: ID!, $version: Int!) {
    submitProgramInitiationRequest(id: $id, version: $version) {
      id
      version
      name
      status
      updatedAt
    }
  }
`

const responseSchema = z.object({
  submitProgramInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    status: z.string().nullable(),
    updatedAt: z.string(),
  }),
})

/**
 * Calls the `submitProgramInitiationRequest` lifecycle mutation.
 * Transitions the request from `draft` → `submitted` (auto-accepted in MVP).
 *
 * @param id - The program PIR identifier.
 * @param version - Current optimistic lock version from the server.
 * @returns A promise resolving to the updated program PIR fields.
 */
export async function submitProgramInitiationRequest(id: string, version: number) {
  const raw = await graphqlClient.request(MUTATION, { id, version })
  const parsed = responseSchema.parse(raw)
  return parsed.submitProgramInitiationRequest
}
