import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation CreateProgramInitiationRequest($input: CreateProgramInitiationRequestInput!) {
    createProgramInitiationRequest(input: $input) {
      id
      version
      name
      documentVersion
      status
      updatedAt
      createdAt
    }
  }
`

const responseSchema = z.object({
  createProgramInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    documentVersion: z.string().nullable(),
    status: z.string().nullable(),
    updatedAt: z.string(),
    createdAt: z.string(),
  }),
})

/** Input type for the createProgramInitiationRequest mutation. */
export interface CreateProgramInitiationRequestInput {
  name: string
  requestingProgramId: string
  portfolioId: string
  documentVersion?: string
  projectInitiator?: string
  projectOwner?: string
  organizationalUnit?: string
  solutionProvider?: string
  approvalAuthority?: string
  requestDate?: string
  estimatedEffort?: number
  estimatedEffortComment?: string
  targetDeliveryDate?: string
  deliveryType?: string
  metadata?: string
}

/**
 * Calls the `createProgramInitiationRequest` GraphQL mutation.
 * Always creates with status `draft` (backend default).
 *
 * @param input - The creation input.
 * @returns A promise resolving to the newly created program PIR.
 */
export async function createProgramInitiationRequest(input: CreateProgramInitiationRequestInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createProgramInitiationRequest
}
