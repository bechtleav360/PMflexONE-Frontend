import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation UpdateProjectInitiationRequest($id: ID!, $input: UpdateProjectInitiationRequestInput!) {
    updateProjectInitiationRequest(id: $id, input: $input) {
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
  updateProjectInitiationRequest: z.object({
    id: z.string(),
    version: z.number(),
    name: z.string(),
    documentVersion: z.string().nullable(),
    status: z.string().nullable(),
    updatedAt: z.string(),
  }),
})

/** Input type for the updateProjectInitiationRequest mutation. Patch semantics — all fields optional except version. */
export interface UpdateProjectInitiationRequestInput {
  version: number
  name?: string
  requestingProjectId?: string
  scopeType?: string
  scopeId?: string
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
 * Calls the `updateProjectInitiationRequest` GraphQL mutation (patch semantics).
 * The `version` field in `input` enforces optimistic concurrency control.
 *
 * @param id - The PIR identifier.
 * @param input - The patch input. Must include `version`.
 * @returns A promise resolving to the updated PIR fields.
 */
export async function updateProjectInitiationRequest(
  id: string,
  input: UpdateProjectInitiationRequestInput,
) {
  const raw = await graphqlClient.request(MUTATION, { id, input })
  const parsed = responseSchema.parse(raw)
  return parsed.updateProjectInitiationRequest
}
