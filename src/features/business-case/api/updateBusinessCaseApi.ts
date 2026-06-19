import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation UpdateBusinessCase($input: UpdateBusinessCaseInput!) {
    updateBusinessCase(input: $input) {
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
  updateBusinessCase: z.object({
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

/**
 * Input type for the updateBusinessCase mutation.
 * `id` and `version` are inside the input object (confirmed backend schema — not separate args).
 */
export interface UpdateBusinessCaseInput {
  id: string
  version: number
  clientSummary?: string
  projectRationale?: string
  expectedBenefit?: string
  options?: string
  investmentCalculation?: string
  keyRisks?: string
  expectedNegativeSideEffect?: string
  timeline?: string
  metadata?: string
}

/**
 * Calls the `updateBusinessCase` GraphQL mutation.
 * Patch semantics — only provided fields are updated. Does NOT change status.
 * `version` is required for optimistic concurrency control.
 *
 * @param input - The update input including `id`, `version`, and optional content fields.
 * @returns A promise resolving to the updated Business Case (id, version, status, updatedAt, project).
 */
export async function updateBusinessCase(input: UpdateBusinessCaseInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.updateBusinessCase
}
