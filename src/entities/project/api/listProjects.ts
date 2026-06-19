import { z } from 'zod'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Project } from '../types/project.types'

/**
 * Optional filter variables accepted by the `projects` GraphQL query.
 *
 * All fields are optional. Fields set to `null` or `undefined` are omitted
 * from the request so the server receives only the active constraints.
 *
 * @property name - Substring match on project name.
 * @property governanceStatus - Exact match on governance status enum value.
 * @property sizeClassification - Exact match on size classification enum value.
 * @property startDateFrom - Inclusive lower bound for the start date (ISO date string).
 * @property startDateTo - Inclusive upper bound for the start date (ISO date string).
 * @property endDateFrom - Inclusive lower bound for the end date (ISO date string).
 * @property endDateTo - Inclusive upper bound for the end date (ISO date string).
 */
export interface ProjectFilter {
  name?: string | null
  governanceStatus?: string | null
  sizeClassification?: string | null
  startDateFrom?: string | null
  startDateTo?: string | null
  endDateFrom?: string | null
  endDateTo?: string | null
}

const QUERY = /* GraphQL */ `
  query ListProjects($filter: ProjectFilter) {
    projects(filter: $filter) {
      id
      name
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
  projects: z.array(projectSchema),
})

/**
 * Fetches the list of projects from the backend, with optional server-side filtering.
 *
 * Passes `$filter` only when at least one field is non-null/non-empty to avoid
 * sending `filter: null` to the server.
 *
 * @param filter - Optional filter object. Undefined or all-null produces an unfiltered request.
 * @returns A promise resolving to the array of projects.
 */
export async function listProjects(filter?: ProjectFilter): Promise<Project[]> {
  const raw = await graphqlClient.request(
    QUERY,
    (filter ? { filter } : {}) as { filter?: ProjectFilter },
  )
  const parsed = responseSchema.parse(raw)
  return parsed.projects
}
