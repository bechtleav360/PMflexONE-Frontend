/**
 * Status constants for risk/opportunity entries.
 *
 * ⚠️ Confirm exact string values against the `lookupRiskEntryStatus` backend
 * response before running integration tests.
 */
export const RISK_ENTRY_STATUS = {
  PROPOSED: 'PROPOSED',
  ASSESSED: 'ASSESSED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  OCCURRED: 'OCCURRED',
  CLOSED: 'CLOSED',
} as const

/** Union type of all valid risk entry status values. */
export type RiskEntryStatus = (typeof RISK_ENTRY_STATUS)[keyof typeof RISK_ENTRY_STATUS]

/** i18n keys for each risk entry status value. Pass the value through `t()` before displaying. */
export const RISK_ENTRY_STATUS_LABELS: Record<string, string | undefined> = {
  [RISK_ENTRY_STATUS.PROPOSED]: 'pages.riskManagement.status.PROPOSED',
  [RISK_ENTRY_STATUS.ASSESSED]: 'pages.riskManagement.status.ASSESSED',
  [RISK_ENTRY_STATUS.PENDING_APPROVAL]: 'pages.riskManagement.status.PENDING_APPROVAL',
  [RISK_ENTRY_STATUS.APPROVED]: 'pages.riskManagement.status.APPROVED',
  [RISK_ENTRY_STATUS.REJECTED]: 'pages.riskManagement.status.REJECTED',
  [RISK_ENTRY_STATUS.OCCURRED]: 'pages.riskManagement.status.OCCURRED',
  [RISK_ENTRY_STATUS.CLOSED]: 'pages.riskManagement.status.CLOSED',
} satisfies Record<RiskEntryStatus, string>

/**
 * Status constants for issue entries (ITSM issue lifecycle).
 *
 * ⚠️ Confirm exact string values against the `lookupIssueEntryStatus` backend
 * response before running integration tests.
 */
export const ISSUE_ENTRY_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  DEFERRED: 'DEFERRED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const

/** Union type of all valid issue entry status values. */
export type IssueEntryStatus = (typeof ISSUE_ENTRY_STATUS)[keyof typeof ISSUE_ENTRY_STATUS]

/** i18n keys for each issue entry status value. Pass the value through `t()` before displaying. */
export const ISSUE_ENTRY_STATUS_LABELS: Record<string, string | undefined> = {
  [ISSUE_ENTRY_STATUS.OPEN]: 'pages.issueManagement.status.OPEN',
  [ISSUE_ENTRY_STATUS.IN_PROGRESS]: 'pages.issueManagement.status.IN_PROGRESS',
  [ISSUE_ENTRY_STATUS.DEFERRED]: 'pages.issueManagement.status.DEFERRED',
  [ISSUE_ENTRY_STATUS.RESOLVED]: 'pages.issueManagement.status.RESOLVED',
  [ISSUE_ENTRY_STATUS.CLOSED]: 'pages.issueManagement.status.CLOSED',
} satisfies Record<IssueEntryStatus, string>

/**
 * Status constants for problem entries (ITIL problem management lifecycle).
 *
 * ⚠️ Confirm exact string values against the `lookupProblemEntryStatus` backend
 * response before running integration tests.
 */
export const PROBLEM_ENTRY_STATUS = {
  OPEN: 'OPEN',
  IN_ANALYSIS: 'IN_ANALYSIS',
  WORKAROUND_KNOWN: 'WORKAROUND_KNOWN',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const

/** Union type of all valid problem entry status values. */
export type ProblemEntryStatus = (typeof PROBLEM_ENTRY_STATUS)[keyof typeof PROBLEM_ENTRY_STATUS]

/** i18n keys for each problem entry status value. Pass the value through `t()` before displaying. */
export const PROBLEM_ENTRY_STATUS_LABELS: Record<string, string | undefined> = {
  [PROBLEM_ENTRY_STATUS.OPEN]: 'pages.problemManagement.status.OPEN',
  [PROBLEM_ENTRY_STATUS.IN_ANALYSIS]: 'pages.problemManagement.status.IN_ANALYSIS',
  [PROBLEM_ENTRY_STATUS.WORKAROUND_KNOWN]: 'pages.problemManagement.status.WORKAROUND_KNOWN',
  [PROBLEM_ENTRY_STATUS.RESOLVED]: 'pages.problemManagement.status.RESOLVED',
  [PROBLEM_ENTRY_STATUS.CLOSED]: 'pages.problemManagement.status.CLOSED',
} satisfies Record<ProblemEntryStatus, string>

/**
 * Statuses that lock a risk/opportunity entry — the status field must be
 * disabled in the edit form once any of these values is saved.
 */
export const RISK_ENTRY_IRREVERSIBLE_STATUSES: string[] = [
  RISK_ENTRY_STATUS.APPROVED,
  RISK_ENTRY_STATUS.OCCURRED,
  RISK_ENTRY_STATUS.REJECTED,
  RISK_ENTRY_STATUS.CLOSED,
] satisfies RiskEntryStatus[]

/**
 * Statuses that lock an issue entry — the status field must be disabled in the
 * edit form once any of these values is saved.
 */
export const ISSUE_ENTRY_IRREVERSIBLE_STATUSES: string[] = [
  ISSUE_ENTRY_STATUS.RESOLVED,
  ISSUE_ENTRY_STATUS.CLOSED,
] satisfies IssueEntryStatus[]

/**
 * Statuses that lock a problem entry — the status field must be disabled in the
 * edit form once any of these values is saved.
 */
export const PROBLEM_ENTRY_IRREVERSIBLE_STATUSES: string[] = [
  PROBLEM_ENTRY_STATUS.RESOLVED,
  PROBLEM_ENTRY_STATUS.CLOSED,
] satisfies ProblemEntryStatus[]

/**
 * Returns `true` when the "Create issue" action should be available for a risk
 * entry. Restricted to type=RISK AND status=OCCURRED.
 *
 * The action button must be completely absent (not disabled) when this returns false.
 *
 * @param entry - The risk entry to check.
 * @param entry.type - The type of the entry ('RISK' or 'OPPORTUNITY').
 * @param entry.status - The current status of the entry.
 * @returns `true` if the create-issue action is available.
 */
export function canCreateIssueFromRisk(entry: { type: string; status: string }): boolean {
  return entry.type === 'RISK' && entry.status === RISK_ENTRY_STATUS.OCCURRED
}

/**
 * Returns `true` when the "Create problem" action should be available for an
 * issue entry. Blocked once the issue reaches a terminal status.
 *
 * The action button must be completely absent (not disabled) when this returns false.
 *
 * @param entry - The issue entry to check.
 * @param entry.status - The current status of the issue entry.
 * @returns `true` if the create-problem action is available.
 */
export function canCreateProblemFromIssue(entry: { status: string }): boolean {
  return entry.status !== ISSUE_ENTRY_STATUS.RESOLVED && entry.status !== ISSUE_ENTRY_STATUS.CLOSED
}
