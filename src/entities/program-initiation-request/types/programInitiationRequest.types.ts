/**
 * Delivery type for how a program will be executed.
 * Maps to the `DeliveryType` GraphQL enum.
 */
export type DeliveryType = 'internal' | 'external' | 'mixed' | 'unknown'

/** Minimal portfolio reference returned inside a program PIR edge. */
export interface PortfolioReference {
  id: string
  name: string
}

/** Edge between a ProgramInitiationRequest and its linked portfolio. */
export interface ProgramInitiationRequestPortfolioEdge {
  item: PortfolioReference
}

/** Minimal program reference returned inside a PIR edge. */
export interface ProgramReference {
  id: string
  name: string
  status: string | null
}

/** Edge between a ProgramInitiationRequest and its requesting program. */
export interface ProgramInitiationRequestProgramEdge {
  metadata: string | null
  item: ProgramReference
}

/** Person reference for creator/updater fields. */
export interface PersonReference {
  id: string
  firstName: string
  lastName: string
  mail: string
}

/**
 * A formal PMflex program initiation request.
 * Status transitions: `draft` → `submitted` → `accepted`.
 */
export interface ProgramInitiationRequest {
  id: string
  version: number
  name: string
  documentVersion: string | null
  status: string | null
  projectInitiator: string | null
  projectOwner: string | null
  organizationalUnit: string | null
  solutionProvider: string | null
  approvalAuthority: string | null
  requestDate: string | null
  estimatedEffort: number | null
  estimatedEffortComment: string | null
  targetDeliveryDate: string | null
  deliveryType: DeliveryType | null
  createdAt: string
  updatedAt: string
  creator: PersonReference | null
  updater: PersonReference | null
  requestingProgram: ProgramInitiationRequestProgramEdge | null
  /** Linked portfolio, present when a portfolio was selected at creation. */
  portfolio: ProgramInitiationRequestPortfolioEdge | null
}

/** Stable TanStack Query key for the program PIR list query. */
export const listProgramInitiationRequestsQueryKey = ['programInitiationRequests'] as const

/**
 * Returns a stable TanStack Query key for a single program PIR detail query.
 *
 * @param id - The program PIR identifier.
 * @returns The query key tuple.
 */
export function getProgramInitiationRequestQueryKey(id: string) {
  return ['programInitiationRequest', id] as const
}
