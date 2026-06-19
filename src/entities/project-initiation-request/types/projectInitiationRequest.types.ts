/**
 * Delivery type for how a project will be executed.
 * Maps to the `DeliveryType` GraphQL enum.
 */
export type DeliveryType = 'internal' | 'external' | 'mixed' | 'unknown'

/**
 * Minimal project reference returned inside a PIR edge.
 */
export interface ProjectReference {
  /** System-assigned unique identifier. */
  id: string
  /** Human-readable project name. */
  name: string
  /** Current project status, if available. */
  status: string | null
}

/**
 * Edge between a ProjectInitiationRequest and its requesting project.
 * Follows the PMflex edge pattern with optional metadata.
 */
export interface ProjectInitiationRequestProjectEdge {
  /** Optional JSON metadata string; backend-managed, not surfaced in UI. */
  metadata: string | null
  /** The linked project. */
  item: ProjectReference
}

/**
 * Person reference for creator/updater fields.
 */
export interface PersonReference {
  /** System-assigned unique identifier. */
  id: string
  /** First name. */
  firstName: string
  /** Last name. */
  lastName: string
  /** Email address. */
  mail: string
}

/**
 * A formal PMflex project initiation request (Projektinitiierungsantrag).
 * Status transitions: `draft` → `submitted` → `accepted`.
 */
export interface ProjectInitiationRequest {
  /** System-assigned unique identifier. */
  id: string
  /** Optimistic concurrency control counter; managed by backend, not shown in UI. */
  version: number
  /** Human-readable project title. */
  name: string
  /** PMflex document version string (e.g. "1.0"). UI label: "Version". */
  documentVersion: string | null
  /** Current lifecycle status: `draft`, `submitted`, or `accepted`. */
  status: string | null
  /** Free-text name of the project initiator. */
  projectInitiator: string | null
  /** Free-text name of the project owner. */
  projectOwner: string | null
  /** Free-text organisational unit. */
  organizationalUnit: string | null
  /** Free-text name of the solution provider. */
  solutionProvider: string | null
  /** Free-text name of the approving authority. */
  approvalAuthority: string | null
  /** ISO date string (YYYY-MM-DD) for the request date. */
  requestDate: string | null
  /** Estimated effort in person-days. */
  estimatedEffort: number | null
  /** Free-text comment on the effort estimate. */
  estimatedEffortComment: string | null
  /** ISO date string (YYYY-MM-DD) for the target delivery date. */
  targetDeliveryDate: string | null
  /** How the project will be delivered. */
  deliveryType: DeliveryType | null
  /** ISO 8601 timestamp of creation. */
  createdAt: string
  /** ISO 8601 timestamp of last update. */
  updatedAt: string
  /** Person who created the request. */
  creator: PersonReference | null
  /** Person who last updated the request. */
  updater: PersonReference | null
  /** The existing project that acts as the requesting domain. */
  requestingProject: ProjectInitiationRequestProjectEdge | null
  /** Linked program or portfolio scope. */
  scope: { id: string; name: string; scopeType: string | null } | null
}

/** Stable TanStack Query key for the PIR list query. */
export const listProjectInitiationRequestsQueryKey = ['projectInitiationRequests'] as const

/**
 * Returns a stable TanStack Query key for a single PIR detail query.
 * @param id - The PIR identifier.
 * @returns The query key tuple.
 */
export function getProjectInitiationRequestQueryKey(id: string) {
  return ['projectInitiationRequest', id] as const
}
