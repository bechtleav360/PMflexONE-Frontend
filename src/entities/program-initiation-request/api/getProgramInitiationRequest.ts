import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { ProgramInitiationRequest } from '../types/programInitiationRequest.types'

const QUERY = /* GraphQL */ `
  query GetProgramInitiationRequest($id: ID!) {
    programInitiationRequest(id: $id) {
      id
      version
      name
      documentVersion
      status
      projectInitiator
      projectOwner
      organizationalUnit
      solutionProvider
      approvalAuthority
      requestDate
      estimatedEffort
      estimatedEffortComment
      targetDeliveryDate
      deliveryType
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      requestingProgram {
        item {
          id
          name
          status
        }
      }
      portfolio {
        item {
          id
          name
        }
      }
    }
  }
`

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const programReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().nullable(),
})

const edgeSchema = z.object({
  item: programReferenceSchema,
})

const portfolioReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const portfolioEdgeSchema = z.object({
  item: portfolioReferenceSchema,
})

const pirDetailSchema = z.object({
  id: z.string(),
  version: z.number(),
  name: z.string(),
  documentVersion: z.string().nullable(),
  status: z.string().nullable(),
  projectInitiator: z.string().nullable(),
  projectOwner: z.string().nullable(),
  organizationalUnit: z.string().nullable(),
  solutionProvider: z.string().nullable(),
  approvalAuthority: z.string().nullable(),
  requestDate: z.string().nullable(),
  estimatedEffort: z.number().nullable(),
  estimatedEffortComment: z.string().nullable(),
  targetDeliveryDate: z.string().nullable(),
  deliveryType: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
  requestingProgram: edgeSchema.nullable(),
  portfolio: portfolioEdgeSchema.nullable(),
})

const responseSchema = z.object({
  programInitiationRequest: pirDetailSchema,
})

/**
 * Fetches a single program initiation request by ID.
 * The response is validated with Zod at the API boundary.
 *
 * @param id - The program PIR identifier.
 * @returns A promise resolving to the full program PIR detail.
 */
export async function getProgramInitiationRequest(id: string): Promise<ProgramInitiationRequest> {
  const raw = await graphqlClient.request(QUERY, { id })
  const parsed = responseSchema.parse(raw)
  return parsed.programInitiationRequest as ProgramInitiationRequest
}
