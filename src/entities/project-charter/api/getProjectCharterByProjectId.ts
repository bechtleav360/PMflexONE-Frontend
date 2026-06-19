import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  projectCharterSummarySchema,
  type ProjectCharterSummary,
} from '../types/projectCharter.types'

const QUERY = /* GraphQL */ `
  query GetProjectCharterByProjectId($projectId: ID!) {
    projectCharterByProjectId(projectId: $projectId) {
      id
      status
    }
  }
`

const responseSchema = z.object({
  projectCharterByProjectId: projectCharterSummarySchema.nullable(),
})

/**
 * @param projectId - ID of the project.
 * @returns The project charter summary, or null if no charter exists for the project.
 */
export async function getProjectCharterByProjectId(
  projectId: string,
): Promise<ProjectCharterSummary | null> {
  const raw = await graphqlClient.request(QUERY, { projectId })
  const parsed = responseSchema.parse(raw)
  return parsed.projectCharterByProjectId
}
