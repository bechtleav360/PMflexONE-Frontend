import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { projectCharterNodeSchema, type ProjectCharterNode } from '../types/projectCharter.types'

const QUERY = /* GraphQL */ `
  query GetProjectCharter($id: ID!) {
    projectCharter(id: $id) {
      id
      status
      projectSummary
      scopeSummary
      successCriteria
      stakeholders
      requirement
      projectConstraint
      assumption
      risk
      resources
      operationalImplementation
      createdAt
      updatedAt
      version
      creator {
        id
        firstName
        lastName
      }
      updater {
        id
        firstName
        lastName
      }
      project {
        id
      }
    }
  }
`

const responseSchema = z.object({
  projectCharter: projectCharterNodeSchema,
})

/**
 * @param id - Project charter ID.
 * @returns The validated project charter node.
 */
export async function getProjectCharter(id: string): Promise<ProjectCharterNode> {
  const raw = await graphqlClient.request(QUERY, { id })
  const parsed = responseSchema.parse(raw)
  return parsed.projectCharter
}
