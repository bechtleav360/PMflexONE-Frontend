import { z } from 'zod'

import type { Project } from '@/entities/project'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { CreateProjectInput } from '../types/createProject.types'

const MUTATION = /* GraphQL */ `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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
  createProject: projectSchema,
})

/**
 * Sends the `createProject` GraphQL mutation to the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @param input - The validated project creation input.
 * @returns A promise resolving to the newly created project.
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const raw = await graphqlClient.request(MUTATION, { input })
  const parsed = responseSchema.parse(raw)
  return parsed.createProject
}
