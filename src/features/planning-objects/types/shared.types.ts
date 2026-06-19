/** A person reference returned by the GraphQL API. */
export interface Person {
  id: string
  firstName: string
  lastName: string
  mail: string
}

/** Identifies which organizational scope a planning object belongs to. */
export interface ScopeRef {
  id: string
  scopeType: 'Project' | 'Program' | 'Portfolio'
}

/** Minimal reference to a linked entity (used in link panel sections). */
export interface EntityRef {
  id: string
  name: string
}

/** Minimal reference to an entity that exposes status instead of name (e.g. BusinessCase, ProjectCharter). */
export interface EntityRefWithStatus {
  id: string
  status: string
}

/** Scope context for planning object pages. Goals exist at all three levels; Requirements, Assumptions, Constraints are Project-only. */
export type PlanningObjectScopeType = 'Project' | 'Program' | 'Portfolio'
