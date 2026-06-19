import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { ProgramInitiationRequest } from '../types/programInitiationRequest.types'

const QUERY = /* GraphQL */ `
  query GetProgramInitiationRequests(
    $filter: ProgramInitiationRequestFilter
    $pagination: Pagination
    $orderBy: OrderBy
  ) {
    programInitiationRequests(filter: $filter, pagination: $pagination, orderBy: $orderBy) {
      id
      version
      name
      status
      updatedAt
      createdAt
      requestingProgram {
        item {
          id
          name
        }
      }
    }
  }
`

const programReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const edgeSchema = z.object({
  item: programReferenceSchema,
})

const pirListItemSchema = z.object({
  id: z.string(),
  version: z.number(),
  name: z.string(),
  status: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
  requestingProgram: edgeSchema.nullable(),
})

const responseSchema = z.object({
  programInitiationRequests: z.array(pirListItemSchema),
})

type ListVariables = {
  filter?: Record<string, unknown>
  pagination?: Record<string, unknown>
  orderBy?: Record<string, unknown>
}

/**
 * Fetches all program initiation requests in the tenant.
 * The response is validated with Zod at the API boundary.
 *
 * @param variables - Optional filter, pagination, and sort variables.
 * @returns A promise resolving to the array of program PIR list items.
 */
export async function listProgramInitiationRequests(
  variables?: ListVariables,
): Promise<ProgramInitiationRequest[]> {
  const raw = await graphqlClient.request(QUERY, variables ?? {})
  const parsed = responseSchema.parse(raw)
  return parsed.programInitiationRequests as ProgramInitiationRequest[]
}
