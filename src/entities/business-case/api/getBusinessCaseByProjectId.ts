import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

const QUERY = /* GraphQL */ `
  query GetBusinessCaseByProjectId($projectId: ID!) {
    businessCaseByProjectId(projectId: $projectId) {
      id
      status
    }
  }
`

const businessCaseMinimalSchema = z.object({
  id: z.string(),
  status: z.string(),
})

const responseSchema = z.object({
  businessCaseByProjectId: businessCaseMinimalSchema.nullable(),
})

/**
 * Checks whether a Business Case exists for a given project.
 * Returns `{ id, status }` when one exists, `null` otherwise.
 * Used by the PIR detail page to resolve the "Start" vs "View / Edit" button state.
 *
 * @param projectId - The project identifier.
 * @returns A promise resolving to `{ id: string; status: string } | null`.
 */
export async function getBusinessCaseByProjectId(
  projectId: string,
): Promise<{ id: string; status: string } | null> {
  const raw = await graphqlClient.request(QUERY, { projectId })
  const parsed = responseSchema.parse(raw)
  return parsed.businessCaseByProjectId
}
