import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const MUTATION = /* GraphQL */ `
  mutation CreateBusinessCase($input: CreateBusinessCaseInput!) {
    createBusinessCase(input: $input) {
      id
      version
      status
      updatedAt
      createdAt
      project {
        id
        name
      }
    }
  }
`

const responseSchema = z.object({
  createBusinessCase: z.object({
    id: z.string(),
    version: z.number(),
    status: z.string(),
    updatedAt: z.string().nullable(),
    createdAt: z.string().nullable(),
    project: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable(),
  }),
})

/** Input type for the createBusinessCase mutation. */
export interface CreateBusinessCaseInput {
  projectId: string
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
 * Calls the `createBusinessCase` GraphQL mutation.
 * Always creates with status `draft` (backend default).
 * The entity is only created when the user explicitly saves — not on navigation.
 *
 * @param input - The creation input including `projectId` and optional content fields.
 * @returns A promise resolving to the newly created Business Case (id, version, status, timestamps, project).
 */
export async function createBusinessCase(input: CreateBusinessCaseInput) {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createBusinessCase
}
