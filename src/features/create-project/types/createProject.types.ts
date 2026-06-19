import type { ProjectSizeClassification } from '@/entities/project'

/**
 * Input shape sent to the backend `createProject` GraphQL mutation.
 * Dates are serialised to ISO 8601 date strings (YYYY-MM-DD).
 */
export interface CreateProjectInput {
  name: string
  sizeClassification: ProjectSizeClassification
  /** ISO 8601 date string (YYYY-MM-DD). */
  startDate: string
  /** ISO 8601 date string (YYYY-MM-DD). */
  endDate: string
  description?: string
}
