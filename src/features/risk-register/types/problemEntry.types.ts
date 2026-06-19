import type { PestelCategory } from '../utils/pestelOptions'
import type { ActiveEscalationRef, Person } from './riskEntry.types'
import type { ScopeType } from './scopeType'

/** Compact reference to a linked issue entry as returned on ProblemEntry detail queries. */
export interface LinkedIssueEntry {
  id: string
  entryNumber: string
  name: string
  status: string
}

/** Edge type wrapping a linked issue entry on a ProblemEntry detail response. */
export interface ProblemEntryIssueEntryEdge {
  item: LinkedIssueEntry
}

/**
 * Full representation of an ITIL problem entry as returned by the API.
 * Problem entries track root-cause investigations raised from issue escalations
 * or identified directly. They carry only an impact score (no urgency or scope effort).
 */
export interface ProblemEntry {
  id: string
  /** Optimistic-lock version; must be passed back on every update. */
  version: number
  /** Display identifier with P-prefix, e.g. "P001". */
  entryNumber: string
  name: string
  pestelCategory: PestelCategory
  description: string | null
  /** Current status code; validate against PROBLEM_ENTRY_STATUS constants. */
  status: string
  identificationDate: string
  /** Impact (1–5). Null when not assessed. */
  impact: number | null
  createdAt: string
  updatedAt: string
  /** Active escalations; empty when entry is not currently escalated. */
  activeEscalations: ActiveEscalationRef[]
  /** True if this entry has any escalation history (permanent deletion block). */
  everEscalated?: boolean
  owner: Person | null
  reporter: Person | null
  /** Linked issue entries — only present on detail queries (GET_PROBLEM_ENTRY). */
  linkedIssues?: ProblemEntryIssueEntryEdge[]
}

/** Input payload for creating a new problem entry directly. */
export interface CreateProblemEntryInput {
  name: string
  pestelCategory: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  impact?: number
  ownerId?: string
  reporterId?: string
  /** Scope type — determines which domain entity owns this entry. */
  scopeType: ScopeType
  /** ID of the scoped entity. */
  scopeId: string
}

/** Input payload for updating an existing problem entry. */
export interface UpdateProblemEntryInput {
  /** Current version; required for optimistic concurrency. */
  version: number
  name?: string
  pestelCategory?: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  impact?: number
  ownerId?: string
  reporterId?: string
}
