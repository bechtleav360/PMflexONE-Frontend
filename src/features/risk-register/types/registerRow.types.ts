import type { ProblemEntry } from './problemEntry.types'
import type { RiskEntry } from './riskEntry.types'

/** Row type for the Risk Management area table. Each row is a single RiskEntry. */
export type RiskManagementRow = RiskEntry

/** Row type for the Problem Management area table. Each row is a single ProblemEntry. */
export type ProblemManagementRow = ProblemEntry

/** Row type for the Issue Management area table. Each row is a single IssueEntry. */
export type { IssueManagementRow } from './issueEntry.types'

/** Sort direction shared across all management area tables. */
export type SortDirection = 'asc' | 'desc'

/** Filter state for the Risk Management area table. */
export interface RiskManagementFilterState {
  type: 'RISK' | 'OPPORTUNITY' | null
  status: string | null
  pestelCategory: string | null
  /** When true, the API also returns terminal-status entries (rejected, closed). */
  includeTerminalStatuses: boolean
}

/** Filter state for the Issue Management area table. */
export interface IssueManagementFilterState {
  status: string | null
  pestelCategory: string | null
  /** When true, the API also returns terminal-status entries (resolved, closed). */
  includeTerminalStatuses: boolean
}

/** Filter state for the Problem Management area table. */
export interface ProblemManagementFilterState {
  status: string | null
  pestelCategory: string | null
  /** When true, the API also returns terminal-status entries (resolved, closed). */
  includeTerminalStatuses: boolean
}
