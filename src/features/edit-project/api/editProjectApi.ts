import { z } from 'zod'

import type { Project } from '@/entities/project'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { UpdateProjectInput } from '../types/editProject.types'

const MUTATION = /* GraphQL */ `
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
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
  updateProject: projectSchema,
})

/**
 * Sends the `updateProject` GraphQL mutation to the backend.
 * The response is validated with Zod at the API boundary.
 *
 * @param id - The ID of the project to update.
 * @param input - The validated project update input.
 * @returns A promise resolving to the updated project.
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const raw = await graphqlClient.request(MUTATION, { id, input })
  const parsed = responseSchema.parse(raw)
  return parsed.updateProject
}
