import type { EntityRef, EntityRefWithStatus, Person, ScopeRef } from './shared.types'

/** Minimal goal reference used in related-goals lists. */
export interface GoalRef {
  id: string
  name: string
}

/** Minimal requirement reference linked to a goal. */
export interface RequirementRef {
  id: string
  name: string
  status: string
}

/** Goal item as returned by the list query (includes recursive children). */
export interface GoalListItem {
  id: string
  version: number
  sortOrder: number
  name: string
  description: string | null
  progress: number
  dueDate: string | null
  keyResults: string | null
  impact: string | null
  outcome: string | null
  otherInformation: string | null
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
  creator: Person | null
  updater: Person | null
  acceptedBy: Person | null
  parent: { id: string } | null
  children: GoalListItem[]
  scope?: ScopeRef
  parentLevelGoalName: string | null
}

/** Full goal detail including linked entities and parent-level context. */
export interface GoalDetail extends Omit<GoalListItem, 'children'> {
  /** Shallow children — only `id` is fetched in the detail query. */
  children: Array<{ id: string }>
  relatedGoals: GoalRef[]
  linkedRequirements: RequirementRef[]
  businessCase: EntityRefWithStatus | null
  projectCharter: EntityRefWithStatus | null
  initiationRequests: EntityRef[]
  parentLevelGoal: GoalRef | null
}

/** Input shape for creating a new goal. */
export interface CreateGoalInput {
  name: string
  scopeType: string
  scopeId: string
  description?: string | null
  progress?: number
  dueDate?: string | null
  keyResults?: string | null
  impact?: string | null
  outcome?: string | null
  otherInformation?: string | null
  acceptedById?: string | null
  acceptedAt?: string | null
}

/** Input shape for updating an existing goal. */
export interface UpdateGoalInput {
  version: number
  name?: string
  description?: string | null
  progress?: number
  dueDate?: string | null
  keyResults?: string | null
  impact?: string | null
  outcome?: string | null
  otherInformation?: string | null
  acceptedById?: string | null
  acceptedAt?: string | null
}
