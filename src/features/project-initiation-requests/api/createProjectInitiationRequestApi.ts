import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation CreateProjectInitiationRequest($input: CreateProjectInitiationRequestInput!) {
    createProjectInitiationRequest(input: $input) {
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
  createProjectInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    documentVersion: z.string().nullable(),
    status: z.string().nullable(),
    updatedAt: z.string(),
    createdAt: z.string(),
  }),
})

/** Input type for the createProjectInitiationRequest mutation. */
export interface CreateProjectInitiationRequestInput {
  name: string
  requestingProjectId: string
  scopeId: string
  scopeType: string
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
 * Calls the `createProjectInitiationRequest` GraphQL mutation.
 * Always creates with status `draft` (backend default).
 *
 * @param input - The creation input.
 * @returns A promise resolving to the newly created PIR (id, version, name, documentVersion, status, timestamps).
 */
export async function createProjectInitiationRequest(input: CreateProjectInitiationRequestInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createProjectInitiationRequest
}
