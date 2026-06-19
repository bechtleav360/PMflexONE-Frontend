import type { EntityRefWithStatus, Person } from './shared.types'

/** A constraint item as returned by the `projectConstraints` list query. */
export interface ConstraintListItem {
  id: string
  version: number
  name: string
  description: string | null
  timeConstrained: boolean
  dueDate: string | null
  otherInformation: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  owner: Person | null
  /** Read-only link — mutation deferred (FR-026). */
  projectCharter: EntityRefWithStatus | null
  scope?: { id: string; scopeType: 'Project' }
}

/** Input shape for creating a new project constraint. */
export interface CreateConstraintInput {
  name: string
  scopeType: 'Project'
  scopeId: string
  description?: string | null
  timeConstrained?: boolean
  dueDate?: string | null
  otherInformation?: string | null
  ownerId?: string | null
}

/** Input shape for updating an existing project constraint. */
export interface UpdateConstraintInput {
  version: number
  name?: string
  description?: string | null
  /**
   * When `false`, the server clears `dueDate`.
   * Always send `dueDate: null` alongside `timeConstrained: false`.
   */
  timeConstrained?: boolean
  dueDate?: string | null
  otherInformation?: string | null
  ownerId?: string | null
}
