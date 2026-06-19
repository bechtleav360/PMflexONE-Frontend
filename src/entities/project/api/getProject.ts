import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Project } from '../types/project.types'

const QUERY = /* GraphQL */ `
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      sizeClassification
      governanceStatus
      startDate
      endDate
      createdAt
      updatedAt
      version
    }
  }
`

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.string().nullable(),
  sizeClassification: z.enum(['small', 'medium', 'large']).nullable(),
  governanceStatus: z.enum(['formal', 'unmanaged']).nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int(),
})

const responseSchema = z.object({
  project: projectSchema,
})

/**
 * Fetches a single project by ID.
 *
 * @param id - The project ID to fetch.
 * @returns The project record.
 */
export async function getProject(id: string): Promise<Project> {
  const raw = await graphqlClient.request(QUERY, { id })
  const parsed = responseSchema.parse(raw)
  return parsed.project
}
