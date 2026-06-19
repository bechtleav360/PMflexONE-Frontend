import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { ProjectInitiationRequest } from '../types/projectInitiationRequest.types'

const QUERY = /* GraphQL */ `
  query GetProjectInitiationRequests(
    $filter: ProjectInitiationRequestFilter
    $pagination: Pagination
    $orderBy: OrderBy
  ) {
    projectInitiationRequests(filter: $filter, pagination: $pagination, orderBy: $orderBy) {
      id
      version
      name
      status
      updatedAt
      createdAt
      requestingProject {
        item {
          id
          name
        }
      }
    }
  }
`

const projectReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const edgeSchema = z.object({
  item: projectReferenceSchema,
})

const pirListItemSchema = z.object({
  id: z.string(),
  version: z.number(),
  name: z.string(),
  status: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
  requestingProject: edgeSchema.nullable(),
})

const responseSchema = z.object({
  projectInitiationRequests: z.array(pirListItemSchema),
})

type ListVariables = {
  filter?: Record<string, unknown>
  pagination?: Record<string, unknown>
  orderBy?: Record<string, unknown>
}

/**
 * Fetches all project initiation requests in the tenant.
 * The response is validated with Zod at the API boundary.
 *
 * @param variables - Optional filter, pagination, and sort variables.
 * @returns A promise resolving to the array of PIR list items.
 */
export async function listProjectInitiationRequests(
  variables?: ListVariables,
): Promise<ProjectInitiationRequest[]> {
  const raw = await graphqlClient.request(QUERY, variables ?? {})
  const parsed = responseSchema.parse(raw)
  return parsed.projectInitiationRequests as ProjectInitiationRequest[]
}
