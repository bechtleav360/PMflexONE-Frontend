import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation UpdateProgramInitiationRequest($id: ID!, $input: UpdateProgramInitiationRequestInput!) {
    updateProgramInitiationRequest(id: $id, input: $input) {
      id
      version
      name
      documentVersion
      status
      updatedAt
    }
  }
`

const responseSchema = z.object({
  updateProgramInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    documentVersion: z.string().nullable(),
    status: z.string().nullable(),
    updatedAt: z.string(),
  }),
})

/** Input type for the updateProgramInitiationRequest mutation. Patch semantics — all fields optional except version. */
export interface UpdateProgramInitiationRequestInput {
  version: number
  name?: string
  requestingProgramId?: string
  portfolioId?: string
  documentVersion?: string
  projectInitiator?: string
  projectOwner?: string
  organizationalUnit?: string
  solutionProvider?: string
  approvalAuthority?: string
  requestDate?: string | null
  estimatedEffort?: number | null
  estimatedEffortComment?: string
  targetDeliveryDate?: string | null
  deliveryType?: string | null
  metadata?: string
}

/**
 * Calls the `updateProgramInitiationRequest` GraphQL mutation (patch semantics).
 *
 * @param id - The program PIR identifier.
 * @param input - The patch input. Must include `version`.
 * @returns A promise resolving to the updated program PIR fields.
 */
export async function updateProgramInitiationRequest(
  id: string,
  input: UpdateProgramInitiationRequestInput,
) {
  const raw = await graphqlClient.request(MUTATION, { id, input })
  const parsed = responseSchema.parse(raw)
  return parsed.updateProgramInitiationRequest
}
