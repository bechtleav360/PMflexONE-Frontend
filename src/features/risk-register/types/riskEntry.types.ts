import type { PestelCategory } from '../utils/pestelOptions'
import type { ScopeType } from './scopeType'

/** Person reference used for owner and reporter fields. */
export interface Person {
  id: string
  firstName: string
  lastName: string
  mail: string
}

/** Reference to the active escalation on a source entry. */
export interface ActiveEscalationRef {
  id: string
  status: 'ACTIVE' | 'RETURNED' | 'ESCALATED'
  scope: { id: string; scopeType: string } | null
  escalatedAt: string
  escalationChain?: string | null
}

/** Compact reference to a linked issue entry as returned on RiskEntry detail queries. */
export interface LinkedIssueEntry {
  id: string
  entryNumber: string
  name: string
  status: string
}

/** Edge type wrapping a linked issue entry on a RiskEntry detail response. */
export interface RiskEntryIssueEntryEdge {
  item: LinkedIssueEntry
}

/** Full representation of a risk or opportunity entry as returned by the API. */
export interface RiskEntry {
  id: string
  /** Optimistic-lock version; must be passed back on every update. */
  version: number
  /** Display identifier, e.g. "R001" for risks, "C001" for opportunities. */
  entryNumber: string
  type: 'RISK' | 'OPPORTUNITY'
  name: string
  pestelCategory: PestelCategory
  description: string | null
  /** Current status code; validate against RISK_ENTRY_STATUS constants. */
  status: string
  identificationDate: string
  /** Probability of occurrence (1–5). Null when not assessed. */
  probability: number | null
  /** Impact (1–5). Null when not assessed. */
  impact: number | null
  /**
   * Computed risk level (probability × impact). Null if either factor is absent.
   * Frontend maps this integer to a color token via getRiskLevelToken().
   */
  riskLevel: number | null
  createdAt: string
  updatedAt: string
  /** Active escalations; empty when entry is not currently escalated. */
  activeEscalations: ActiveEscalationRef[]
  /** True if this entry has any escalation history (permanent deletion block). */
  everEscalated?: boolean
  owner: Person | null
  reporter: Person | null
  /** Linked issue entries — only present on detail queries (GET_RISK_ENTRY). */
  linkedIssues?: RiskEntryIssueEntryEdge[]
}

/** Input payload for creating a new risk or opportunity entry. */
export interface CreateRiskEntryInput {
  type: 'RISK' | 'OPPORTUNITY'
  name: string
  pestelCategory: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  probability?: number
  impact?: number
  ownerId?: string
  reporterId?: string
  /** Scope type — determines which domain entity owns this entry. */
  scopeType: ScopeType
  /** ID of the scoped entity. */
  scopeId: string
}

/** Input payload for updating an existing risk or opportunity entry. */
export interface UpdateRiskEntryInput {
  /** Current version; required for optimistic concurrency. */
  version: number
  name?: string
  pestelCategory?: PestelCategory
  description?: string
  status?: string
  identificationDate?: string
  probability?: number
  impact?: number
  ownerId?: string
  reporterId?: string
}
