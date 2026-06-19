import type { PestelCategory } from '../utils/pestelOptions'
import type { ActiveEscalationRef, Person } from './riskEntry.types'
import type { ScopeType } from './scopeType'

/** Compact reference to a linked risk entry as returned on IssueEntry detail queries. */
export interface LinkedRiskEntry {
  id: string
  entryNumber: string
  name: string
  status: string
  type: string
}

/** Compact reference to a linked problem entry as returned on IssueEntry detail queries. */
export interface LinkedProblemEntry {
  id: string
  entryNumber: string
  name: string
  status: string
}

/** Edge type wrapping a linked risk entry on an IssueEntry detail response. */
export interface IssueEntryRiskEntryEdge {
  item: LinkedRiskEntry
}

/** Edge type wrapping a linked problem entry on an IssueEntry detail response. */
export interface IssueEntryProblemEntryEdge {
  item: LinkedProblemEntry
}

/**
 * Full representation of an issue entry as returned by the API.
 * Issue entries track active incidents raised from risk occurrence or identified directly.
 * They carry urgency and impact scores.
 */
export interface IssueEntry {
  id: string
  /** Optimistic-lock version; must be passed back on every update. */
  version: number
  /** Display identifier with I-prefix, e.g. "I001". */
  entryNumber: string
  name: string
  pestelCategory: PestelCategory
  description: string | null
  /** Current status code; validate against ISSUE_ENTRY_STATUS constants. */
  status: string
  identificationDate: string
  /** Urgency (1–5). Null when not assessed. */
  urgency: number | null
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
  /** Linked risk entries — only present on detail queries (GET_ISSUE_ENTRY). */
  linkedRisks?: IssueEntryRiskEntryEdge[]
  /** Linked problem entries — only present on detail queries (GET_ISSUE_ENTRY). */
  linkedProblems?: IssueEntryProblemEntryEdge[]
}

/** Row type for the Issue Management area table. Each row is a single IssueEntry. */
export type IssueManagementRow = IssueEntry

/** Input payload for creating a new issue entry directly. */
export interface CreateIssueEntryInput {
  name: string
  pestelCategory: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  urgency?: number
  impact?: number
  ownerId?: string
  reporterId?: string
  /** Scope type — determines which domain entity owns this entry. */
  scopeType: ScopeType
  /** ID of the scoped entity. */
  scopeId: string
}

/** Input payload for updating an existing issue entry. */
export interface UpdateIssueEntryInput {
  /** Current version; required for optimistic concurrency. */
  version: number
  name?: string
  pestelCategory?: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  urgency?: number
  impact?: number
  ownerId?: string
  reporterId?: string
}
