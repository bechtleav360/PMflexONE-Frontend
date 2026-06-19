import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation CreateProjectCharter($input: CreateProjectCharterInput!) {
    createProjectCharter(input: $input) {
      id
      status
      version
      project {
        id
      }
    }
  }
`

const responseSchema = z.object({
  createProjectCharter: z.object({
    id: z.string(),
    status: z.string(),
    version: z.number(),
    project: z.object({ id: z.string() }).nullable(),
  }),
})

/** Input for the createProjectCharter mutation. */
export interface CreateProjectCharterInput {
  projectId: string
  projectSummary?: string
  scopeSummary?: string
  successCriteria?: string
  stakeholders?: string
  requirement?: string
  projectConstraint?: string
  assumption?: string
  risk?: string
  resources?: string
  operationalImplementation?: string
}

/**
 * Sends the `createProjectCharter` GraphQL mutation to the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @param input - Fields for the new project charter.
 * @returns A promise resolving to the newly created charter (id, status, version, project).
 */
export async function createProjectCharter(input: CreateProjectCharterInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createProjectCharter
}
