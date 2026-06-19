/**
 * Size classification of a project.
 * Maps to the `ProjectSizeClassification` GraphQL enum.
 */
export type ProjectSizeClassification = 'small' | 'medium' | 'large'

/**
 * Governance status of a project.
 * Maps to the `GovernanceStatus` GraphQL enum.
 */
export type GovernanceStatus = 'formal' | 'unmanaged'

/**
 * Minimal project projection returned by `projects` and `createProject`.
 * Fields align with the backend GraphQL schema.
 */
export interface Project {
  /** System-assigned unique identifier. */
  id: string
  /** Human-readable project name. */
  name: string
  /** Optional project description. */
  description?: string | null
  /** Current project status. */
  status: string | null
  /** Project size classification. */
  sizeClassification: ProjectSizeClassification | null
  /** Governance status indicating whether the project is formally or informally managed. */
  governanceStatus: GovernanceStatus | null
  /** Project start date in ISO 8601 format (YYYY-MM-DD). */
  startDate: string | null
  /** Project end date in ISO 8601 format (YYYY-MM-DD). */
  endDate: string | null
  /** ISO 8601 timestamp of when the project was created. */
  createdAt: string
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string
  /** Optimistic-locking version counter. */
  version: number
}
