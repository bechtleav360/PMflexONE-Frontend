import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation SubmitBusinessCase($input: SubmitBusinessCaseInput!) {
    submitBusinessCase(input: $input) {
      id
      version
      status
      updatedAt
      project {
        id
        name
      }
    }
  }
`

const responseSchema = z.object({
  submitBusinessCase: z.object({
    id: z.string(),
    version: z.number(),
    status: z.string(),
    updatedAt: z.string().nullable(),
    project: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable(),
  }),
})

/** Input type for the submitBusinessCase lifecycle mutation. */
export interface SubmitBusinessCaseInput {
  id: string
  version: number
}

/**
 * Calls the `submitBusinessCase` GraphQL mutation.
 * Lifecycle transition — sets Business Case to `submitted` state (user-facing: "Mark as Complete").
 * After this, the Project Charter navigation entry point becomes visible.
 *
 * @param input - The submit input including `id` and current `version`.
 * @returns A promise resolving to the submitted Business Case (id, version, status, updatedAt, project).
 */
export async function submitBusinessCase(input: SubmitBusinessCaseInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.submitBusinessCase
}
