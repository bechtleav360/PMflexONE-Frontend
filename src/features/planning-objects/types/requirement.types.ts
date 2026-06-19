import type { Person, ScopeRef } from './shared.types'

/** Possible scopes a requirement can belong to. */
export type RequirementScope = 'IN_SCOPE' | 'OUT_OF_SCOPE'

/** Source of the requirement. */
export type RequirementSource = 'INTERNAL' | 'EXTERNAL'

/** Functional classification of the requirement. */
export type RequirementType = 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'CONSTRAINT'

/** Priority level following MoSCoW notation. */
export type RequirementPriority = 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE'

/** Lifecycle status of the requirement. */
export type RequirementStatus =
  | 'NEW'
  | 'ANALYSED'
  | 'SPECIFIED'
  | 'IMPLEMENTED'
  | 'TESTED'
  | 'ACCEPTED'

/** Directed edge type between two requirements (lowercase, matching backend). */
export type RequirementDependencyEdgeType =
  | 'blocks'
  | 'blocked_by'
  | 'duplicates'
  | 'duplicated_by'
  | 'relates_to'

/** Minimal reference to a linked goal. */
export interface GoalRef {
  id: string
  name: string
}

/** A single dependency edge to another requirement. */
export interface RequirementDependency {
  /** The directed edge type. */
  edgeTypeName: RequirementDependencyEdgeType
  /** The requirement on the other end of the edge. */
  requirement: {
    id: string
    name: string
    status: RequirementStatus
  }
}

/** Requirement as returned by the list query (flat, with parent reference). */
export interface RequirementListItem {
  id: string
  version: number
  sortOrder: number
  name: string
  requirementScope: RequirementScope
  source: RequirementSource
  estimatedEffortMin: number | null
  estimatedEffortMax: number | null
  type: RequirementType
  priority: RequirementPriority
  status: RequirementStatus
  createdAt: string
  updatedAt: string
  creator: Person | null
  parent: { id: string } | null
  scope?: ScopeRef
}

/** Full requirement detail including description, criteria, links, and dependencies. */
export interface RequirementDetail extends RequirementListItem {
  description: string | null
  acceptanceCriteria: string | null
  updater: Person | null
  dependencies: RequirementDependency[]
  linkedGoals: GoalRef[]
}

/** Input shape for creating a new requirement. */
export interface CreateRequirementInput {
  name: string
  scopeType: string
  scopeId: string
  requirementScope: RequirementScope
  source: RequirementSource
  type: RequirementType
  priority: RequirementPriority
  status: RequirementStatus
  estimatedEffortMin?: number | null
  estimatedEffortMax?: number | null
  description?: string | null
  acceptanceCriteria?: string | null
}

/** Input shape for updating an existing requirement. */
export interface UpdateRequirementInput {
  version: number
  name?: string
  requirementScope?: RequirementScope
  source?: RequirementSource
  type?: RequirementType
  priority?: RequirementPriority
  status?: RequirementStatus
  estimatedEffortMin?: number | null
  estimatedEffortMax?: number | null
  description?: string | null
  acceptanceCriteria?: string | null
}
