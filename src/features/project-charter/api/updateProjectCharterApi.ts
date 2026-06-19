import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation UpdateProjectCharter($input: UpdateProjectCharterInput!) {
    updateProjectCharter(input: $input) {
      id
      status
      version
      updatedAt
      project {
        id
      }
    }
  }
`

const responseSchema = z.object({
  updateProjectCharter: z.object({
    id: z.string(),
    status: z.string(),
    version: z.number(),
    updatedAt: z.string().nullable(),
    project: z.object({ id: z.string() }).nullable(),
  }),
})

/** Input for the updateProjectCharter mutation. */
export interface UpdateProjectCharterInput {
  id: string
  /** Required for optimistic concurrency control. */
  version: number
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
 * Sends the `updateProjectCharter` GraphQL mutation to the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @param input - Updated fields including `id` and `version` for optimistic concurrency.
 * @returns A promise resolving to the updated charter (id, status, version, updatedAt, project).
 */
export async function updateProjectCharter(input: UpdateProjectCharterInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.updateProjectCharter
}
