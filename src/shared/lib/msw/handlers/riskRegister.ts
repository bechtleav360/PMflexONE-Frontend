/* eslint-disable max-lines, complexity -- MSW handler file; line count and branching scale with number of mocked API endpoints and response variants */
import { graphql, HttpResponse } from 'msw'

import type { ScopeType } from '@/features/risk-register/types/scopeType'
import { proj1 } from '@/shared/test-utils/fixtures'

const TERMINAL_RISK_STATUSES = ['REJECTED', 'CLOSED']
const TERMINAL_ISSUE_STATUSES = ['RESOLVED', 'CLOSED']
const TERMINAL_PROBLEM_STATUSES = ['RESOLVED', 'CLOSED']

type ActiveEscalationRef = {
  id: string
  status: 'ACTIVE' | 'RETURNED' | 'ESCALATED'
  scope: { id: string; scopeType: 'Program' | 'Portfolio' } | null
  escalatedAt: string
  escalationChain: string | null
}

type RiskEntry = {
  id: string
  version: number
  entryNumber: string
  type: string
  name: string
  pestelCategory: string
  description: string | null
  status: string
  identificationDate: string
  probability: number | null
  impact: number | null
  riskLevel: number | null
  createdAt: string
  updatedAt: string
  scopeType: ScopeType
  scopeId: string
  activeEscalations: ActiveEscalationRef[]
  owner: null
  reporter: null
}

type IssueEntry = {
  id: string
  version: number
  entryNumber: string
  name: string
  pestelCategory: string
  description: string | null
  status: string
  identificationDate: string
  urgency: number | null
  impact: number | null
  createdAt: string
  updatedAt: string
  scopeType: ScopeType
  scopeId: string
  activeEscalations: ActiveEscalationRef[]
  owner: null
  reporter: null
}

type ProblemEntry = {
  id: string
  version: number
  entryNumber: string
  name: string
  pestelCategory: string
  description: string | null
  status: string
  identificationDate: string
  impact: number | null
  createdAt: string
  updatedAt: string
  scopeType: ScopeType
  scopeId: string
  activeEscalations: ActiveEscalationRef[]
  owner: null
  reporter: null
}

const devRiskEntries: RiskEntry[] = [
  {
    id: 'risk-seed-1',
    version: 1,
    entryNumber: 'R-001',
    type: 'RISK',
    name: 'Budget overrun',
    pestelCategory: 'ECONOMIC',
    description: null,
    status: 'ASSESSED',
    identificationDate: '2026-01-01',
    probability: 3,
    impact: 4,
    riskLevel: 12,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'risk-seed-2',
    version: 1,
    entryNumber: 'R-002',
    type: 'RISK',
    name: 'Cost escalation',
    pestelCategory: 'ECONOMIC',
    description: null,
    status: 'OCCURRED',
    identificationDate: '2026-01-01',
    probability: null,
    impact: null,
    riskLevel: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'risk-seed-3',
    version: 1,
    entryNumber: 'R-003',
    type: 'OPPORTUNITY',
    name: 'Process automation',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'ASSESSED',
    identificationDate: '2026-01-01',
    probability: 2,
    impact: 3,
    riskLevel: 6,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'risk-seed-4',
    version: 1,
    entryNumber: 'R-004',
    type: 'RISK',
    name: 'Vendor delay',
    pestelCategory: 'ECONOMIC',
    description: null,
    status: 'REJECTED',
    identificationDate: '2026-01-01',
    probability: null,
    impact: null,
    riskLevel: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'risk-seed-5',
    version: 1,
    entryNumber: 'R-005',
    type: 'RISK',
    name: 'Staff issues',
    pestelCategory: 'SOCIAL',
    description: null,
    status: 'CLOSED',
    identificationDate: '2026-01-01',
    probability: null,
    impact: null,
    riskLevel: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
]

const devIssueEntries: IssueEntry[] = [
  {
    id: 'issue-seed-1',
    version: 1,
    entryNumber: 'I-001',
    name: 'Server unavailable',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'OPEN',
    identificationDate: '2026-01-01',
    urgency: null,
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'issue-seed-2',
    version: 1,
    entryNumber: 'I-002',
    name: 'Login service failure',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'OPEN',
    identificationDate: '2026-01-01',
    urgency: null,
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'issue-seed-3',
    version: 1,
    entryNumber: 'I-003',
    name: 'Database timeout',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'RESOLVED',
    identificationDate: '2026-01-01',
    urgency: null,
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'issue-seed-4',
    version: 1,
    entryNumber: 'I-004',
    name: 'Network outage',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'CLOSED',
    identificationDate: '2026-01-01',
    urgency: null,
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
]

const devProblemEntries: ProblemEntry[] = [
  {
    id: 'problem-seed-1',
    version: 1,
    entryNumber: 'P-001',
    name: 'Database corruption',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'OPEN',
    identificationDate: '2026-01-01',
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
  {
    id: 'problem-seed-2',
    version: 1,
    entryNumber: 'P-002',
    name: 'ITSM process failure',
    pestelCategory: 'TECHNOLOGICAL',
    description: null,
    status: 'RESOLVED',
    identificationDate: '2026-01-01',
    impact: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    scopeType: 'Project',
    scopeId: proj1,
    activeEscalations: [],
    owner: null,
    reporter: null,
  },
]

let nextRiskId = 100
let nextIssueId = 100
let nextProblemId = 100

function computeRiskLevel(probability: number | null, impact: number | null): number | null {
  if (probability == null || impact == null) return null
  return probability * impact
}

// --- Risk entry handlers ---

const getRiskEntriesHandler = graphql.query('GetRiskEntries', ({ variables }) => {
  const filter =
    (
      variables as {
        filter?: { scopeType?: string; scopeId?: string; includeTerminalStatuses?: boolean }
      }
    ).filter ?? {}
  const { scopeType, scopeId, includeTerminalStatuses = false } = filter

  const entries = devRiskEntries.filter((e) => {
    if (scopeType && e.scopeType !== scopeType) return false
    if (scopeId && e.scopeId !== scopeId) return false
    if (!includeTerminalStatuses && TERMINAL_RISK_STATUSES.includes(e.status)) return false
    return true
  })

  return HttpResponse.json({ data: { riskEntries: entries } })
})

const getRiskEntryHandler = graphql.query('GetRiskEntry', ({ variables }) => {
  const { id } = variables as { id: string }
  const entry = devRiskEntries.find((e) => e.id === id) ?? null
  return HttpResponse.json({ data: { riskEntry: entry } })
})

const lookupRiskEntryStatusHandler = graphql.query('LookupRiskEntryStatus', () =>
  HttpResponse.json({
    data: {
      lookupRiskEntryStatus: [
        { status: 'PROPOSED', description: 'Proposed', displayOrder: 1 },
        { status: 'ASSESSED', description: 'Assessed', displayOrder: 2 },
        { status: 'PENDING_APPROVAL', description: 'Pending Approval', displayOrder: 3 },
        { status: 'APPROVED', description: 'Approved', displayOrder: 4 },
        { status: 'OCCURRED', description: 'Occurred', displayOrder: 5 },
        { status: 'REJECTED', description: 'Rejected', displayOrder: 6 },
        { status: 'CLOSED', description: 'Closed', displayOrder: 7 },
      ],
    },
  }),
)

const createRiskEntryHandler = graphql.mutation('CreateRiskEntry', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const now = new Date().toISOString()
  const probability = (input.probability as number | null) ?? null
  const impact = (input.impact as number | null) ?? null

  const entry: RiskEntry = {
    id: `risk-${nextRiskId++}`,
    version: 1,
    entryNumber: `R-${String(nextRiskId).padStart(3, '0')}`,
    type: (input.type as string) ?? 'risk',
    name: input.name as string,
    pestelCategory: input.pestelCategory as string,
    description: (input.description as string | null) ?? null,
    status: 'PROPOSED',
    identificationDate: (input.identificationDate as string) ?? now.split('T')[0],
    probability,
    impact,
    riskLevel: computeRiskLevel(probability, impact),
    createdAt: now,
    updatedAt: now,
    scopeType: (input.scopeType as ScopeType) ?? 'Project',
    scopeId: (input.scopeId as string) ?? '',
    activeEscalations: [],
    owner: null,
    reporter: null,
  }

  devRiskEntries.push(entry)
  return HttpResponse.json({ data: { createRiskEntry: entry } })
})

const updateRiskEntryHandler = graphql.mutation('UpdateRiskEntry', ({ variables }) => {
  const { id, input } = variables as { id: string; input: Record<string, unknown> }
  const existing = devRiskEntries.find((e) => e.id === id)
  if (!existing) {
    return HttpResponse.json({ errors: [{ message: 'Risk entry not found' }] }, { status: 200 })
  }

  const now = new Date().toISOString()
  const probability = (input.probability as number | null) ?? existing.probability
  const impact = (input.impact as number | null) ?? existing.impact

  Object.assign(existing, {
    ...input,
    probability,
    impact,
    riskLevel: computeRiskLevel(probability, impact),
    updatedAt: now,
    version: existing.version + 1,
  })

  return HttpResponse.json({ data: { updateRiskEntry: existing } })
})

const createIssueFromRiskHandler = graphql.mutation('CreateIssueFromRisk', ({ variables }) => {
  const { riskEntryId } = variables as { riskEntryId: string; version: number }
  const risk = devRiskEntries.find((e) => e.id === riskEntryId)
  const now = new Date().toISOString()

  const issueEntry: IssueEntry = {
    id: `issue-${nextIssueId++}`,
    version: 1,
    entryNumber: `I-${String(nextIssueId).padStart(3, '0')}`,
    name: risk?.name ?? 'Escalated issue',
    pestelCategory: risk?.pestelCategory ?? 'economic',
    description: null,
    status: 'OPEN',
    identificationDate: now.split('T')[0],
    urgency: null,
    impact: null,
    createdAt: now,
    updatedAt: now,
    scopeType: risk?.scopeType ?? 'Project',
    scopeId: risk?.scopeId ?? '',
    activeEscalations: [],
    owner: null,
    reporter: null,
  }

  devIssueEntries.push(issueEntry)
  return HttpResponse.json({ data: { createIssueFromRisk: issueEntry } })
})

// --- Issue entry handlers ---

const getIssueEntriesHandler = graphql.query('GetIssueEntries', ({ variables }) => {
  const filter =
    (
      variables as {
        filter?: { scopeType?: string; scopeId?: string; includeTerminalStatuses?: boolean }
      }
    ).filter ?? {}
  const { scopeType, scopeId, includeTerminalStatuses = false } = filter

  const entries = devIssueEntries.filter((e) => {
    if (scopeType && e.scopeType !== scopeType) return false
    if (scopeId && e.scopeId !== scopeId) return false
    if (!includeTerminalStatuses && TERMINAL_ISSUE_STATUSES.includes(e.status)) return false
    return true
  })

  return HttpResponse.json({ data: { issueEntries: entries } })
})

const getIssueEntryHandler = graphql.query('GetIssueEntry', ({ variables }) => {
  const { id } = variables as { id: string }
  const entry = devIssueEntries.find((e) => e.id === id) ?? null
  return HttpResponse.json({ data: { issueEntry: entry } })
})

const lookupIssueEntryStatusHandler = graphql.query('LookupIssueEntryStatus', () =>
  HttpResponse.json({
    data: {
      lookupIssueEntryStatus: [
        { status: 'OPEN', description: 'Open', displayOrder: 1 },
        { status: 'IN_PROGRESS', description: 'In Progress', displayOrder: 2 },
        { status: 'DEFERRED', description: 'Deferred', displayOrder: 3 },
        { status: 'RESOLVED', description: 'Resolved', displayOrder: 4 },
        { status: 'CLOSED', description: 'Closed', displayOrder: 5 },
      ],
    },
  }),
)

const createIssueEntryHandler = graphql.mutation('CreateIssueEntry', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const now = new Date().toISOString()

  const entry: IssueEntry = {
    id: `issue-${nextIssueId++}`,
    version: 1,
    entryNumber: `I-${String(nextIssueId).padStart(3, '0')}`,
    name: input.name as string,
    pestelCategory: input.pestelCategory as string,
    description: (input.description as string | null) ?? null,
    status: 'OPEN',
    identificationDate: (input.identificationDate as string) ?? now.split('T')[0],
    urgency: (input.urgency as number | null) ?? null,
    impact: (input.impact as number | null) ?? null,
    createdAt: now,
    updatedAt: now,
    scopeType: (input.scopeType as ScopeType) ?? 'Project',
    scopeId: (input.scopeId as string) ?? '',
    activeEscalations: [],
    owner: null,
    reporter: null,
  }

  devIssueEntries.push(entry)
  return HttpResponse.json({ data: { createIssueEntry: entry } })
})

const updateIssueEntryHandler = graphql.mutation('UpdateIssueEntry', ({ variables }) => {
  const { id, input } = variables as { id: string; input: Record<string, unknown> }
  const existing = devIssueEntries.find((e) => e.id === id)
  if (!existing) {
    return HttpResponse.json({ errors: [{ message: 'Issue entry not found' }] }, { status: 200 })
  }

  const now = new Date().toISOString()
  Object.assign(existing, { ...input, updatedAt: now, version: existing.version + 1 })
  return HttpResponse.json({ data: { updateIssueEntry: existing } })
})

const createProblemFromIssueHandler = graphql.mutation(
  'CreateProblemFromIssue',
  ({ variables }) => {
    const { issueEntryId } = variables as { issueEntryId: string; version: number }
    const issue = devIssueEntries.find((e) => e.id === issueEntryId)
    const now = new Date().toISOString()

    const problemEntry: ProblemEntry = {
      id: `problem-${nextProblemId++}`,
      version: 1,
      entryNumber: `P-${String(nextProblemId).padStart(3, '0')}`,
      name: issue?.name ?? 'Escalated problem',
      pestelCategory: issue?.pestelCategory ?? 'technological',
      description: null,
      status: 'OPEN',
      identificationDate: now.split('T')[0],
      impact: null,
      createdAt: now,
      updatedAt: now,
      scopeType: issue?.scopeType ?? 'Project',
      scopeId: issue?.scopeId ?? '',
      activeEscalations: [],
      owner: null,
      reporter: null,
    }

    devProblemEntries.push(problemEntry)
    return HttpResponse.json({ data: { createProblemFromIssue: problemEntry } })
  },
)

// --- Problem entry handlers ---

const getProblemEntriesHandler = graphql.query('GetProblemEntries', ({ variables }) => {
  const filter =
    (
      variables as {
        filter?: { scopeType?: string; scopeId?: string; includeTerminalStatuses?: boolean }
      }
    ).filter ?? {}
  const { scopeType, scopeId, includeTerminalStatuses = false } = filter

  const entries = devProblemEntries.filter((e) => {
    if (scopeType && e.scopeType !== scopeType) return false
    if (scopeId && e.scopeId !== scopeId) return false
    if (!includeTerminalStatuses && TERMINAL_PROBLEM_STATUSES.includes(e.status)) return false
    return true
  })

  return HttpResponse.json({ data: { problemEntries: entries } })
})

const getProblemEntryHandler = graphql.query('GetProblemEntry', ({ variables }) => {
  const { id } = variables as { id: string }
  const entry = devProblemEntries.find((e) => e.id === id) ?? null
  return HttpResponse.json({ data: { problemEntry: entry } })
})

const lookupProblemEntryStatusHandler = graphql.query('LookupProblemEntryStatus', () =>
  HttpResponse.json({
    data: {
      lookupProblemEntryStatus: [
        { status: 'OPEN', description: 'Open', displayOrder: 1 },
        { status: 'IN_ANALYSIS', description: 'In Analysis', displayOrder: 2 },
        { status: 'WORKAROUND_KNOWN', description: 'Workaround Known', displayOrder: 3 },
        { status: 'RESOLVED', description: 'Resolved', displayOrder: 4 },
        { status: 'CLOSED', description: 'Closed', displayOrder: 5 },
      ],
    },
  }),
)

const createProblemEntryHandler = graphql.mutation('CreateProblemEntry', ({ variables }) => {
  const input = (variables as { input: Record<string, unknown> }).input
  const now = new Date().toISOString()

  const entry: ProblemEntry = {
    id: `problem-${nextProblemId++}`,
    version: 1,
    entryNumber: `P-${String(nextProblemId).padStart(3, '0')}`,
    name: input.name as string,
    pestelCategory: input.pestelCategory as string,
    description: (input.description as string | null) ?? null,
    status: 'OPEN',
    identificationDate: (input.identificationDate as string) ?? now.split('T')[0],
    impact: (input.impact as number | null) ?? null,
    createdAt: now,
    updatedAt: now,
    scopeType: (input.scopeType as ScopeType) ?? 'Project',
    scopeId: (input.scopeId as string) ?? '',
    activeEscalations: [],
    owner: null,
    reporter: null,
  }

  devProblemEntries.push(entry)
  return HttpResponse.json({ data: { createProblemEntry: entry } })
})

const updateProblemEntryHandler = graphql.mutation('UpdateProblemEntry', ({ variables }) => {
  const { id, input } = variables as { id: string; input: Record<string, unknown> }
  const existing = devProblemEntries.find((e) => e.id === id)
  if (!existing) {
    return HttpResponse.json({ errors: [{ message: 'Problem entry not found' }] }, { status: 200 })
  }

  const now = new Date().toISOString()
  Object.assign(existing, { ...input, updatedAt: now, version: existing.version + 1 })
  return HttpResponse.json({ data: { updateProblemEntry: existing } })
})

// --- Escalated entry handlers ---

type EscalatedEntry = {
  id: string
  version: number
  sourceEntryType: string
  sourceEntryId: string
  scope: { id: string; scopeType: 'Program' | 'Portfolio' } | null
  escalationChain: string | null
  status: 'ACTIVE' | 'RETURNED' | 'ESCALATED'
  entryNumber: string
  name: string
  description: string | null
  pestelCategory: string | null
  sourceStatus: string | null
  probability: number | null
  impact: number | null
  riskLevel: number | null
  targetProbability: number | null
  targetImpact: number | null
  escalatedAt: string
  returnedAt: string | null
  createdAt: string
  updatedAt: string
  creator: null
  updater: null
}

const devEscalatedEntries: EscalatedEntry[] = []
let nextEscalatedId = 100

const getEscalatedEntriesHandler = graphql.query('GetEscalatedEntries', ({ variables }) => {
  const filter =
    (variables as { filter?: { scopeId?: string; scopeType?: string; sourceEntryType?: string } })
      .filter ?? {}
  const { scopeId, scopeType, sourceEntryType } = filter

  const entries = devEscalatedEntries.filter((e) => {
    if (scopeId && e.scope?.id !== scopeId) return false
    if (scopeType && e.scope?.scopeType !== scopeType) return false
    if (sourceEntryType && e.sourceEntryType !== sourceEntryType) return false
    return true
  })

  return HttpResponse.json({ data: { escalatedEntries: entries } })
})

const createEscalatedEntryHandler = graphql.mutation('EscalateEntry', ({ variables }) => {
  const input = (
    variables as { input: { sourceEntryId: string; sourceEntryType: string; reason: string } }
  ).input
  const now = new Date().toISOString()

  const sourceRisk = devRiskEntries.find((e) => e.id === input.sourceEntryId)
  const sourceProblem = devProblemEntries.find((e) => e.id === input.sourceEntryId)
  const sourceIssue = devIssueEntries.find((e) => e.id === input.sourceEntryId)
  const sourceEntry = sourceRisk ?? sourceProblem ?? sourceIssue

  const entry: EscalatedEntry = {
    id: `escalated-${nextEscalatedId++}`,
    version: 1,
    sourceEntryType: input.sourceEntryType,
    sourceEntryId: input.sourceEntryId,
    scope: { id: 'e2e00000-0000-0000-0000-000000000001', scopeType: 'Program' },
    escalationChain: null,
    status: 'ACTIVE',
    entryNumber: `E-${String(nextEscalatedId).padStart(3, '0')}`,
    name: sourceEntry?.name ?? 'Escalated entry',
    description: null,
    pestelCategory: sourceEntry?.pestelCategory ?? null,
    sourceStatus: sourceEntry?.status ?? null,
    probability:
      'probability' in (sourceEntry ?? {}) ? (sourceEntry as RiskEntry).probability : null,
    impact: sourceEntry?.impact ?? null,
    riskLevel: 'riskLevel' in (sourceEntry ?? {}) ? (sourceEntry as RiskEntry).riskLevel : null,
    targetProbability: null,
    targetImpact: null,
    escalatedAt: now,
    returnedAt: null,
    createdAt: now,
    updatedAt: now,
    creator: null,
    updater: null,
  }

  devEscalatedEntries.push(entry)

  const activeEscalationRef: ActiveEscalationRef = {
    id: entry.id,
    status: 'ACTIVE',
    scope: entry.scope,
    escalatedAt: now,
    escalationChain: null,
  }

  if (sourceRisk) sourceRisk.activeEscalations = [activeEscalationRef]
  else if (sourceProblem) sourceProblem.activeEscalations = [activeEscalationRef]
  else if (sourceIssue) sourceIssue.activeEscalations = [activeEscalationRef]

  return HttpResponse.json({ data: { createEscalatedEntry: entry } })
})

/** MSW handlers for all risk register GraphQL operations (risks, issues, problems). */
export const riskRegisterHandlers = [
  getRiskEntriesHandler,
  getRiskEntryHandler,
  lookupRiskEntryStatusHandler,
  createRiskEntryHandler,
  updateRiskEntryHandler,
  createIssueFromRiskHandler,
  getIssueEntriesHandler,
  getIssueEntryHandler,
  lookupIssueEntryStatusHandler,
  createIssueEntryHandler,
  updateIssueEntryHandler,
  createProblemFromIssueHandler,
  getProblemEntriesHandler,
  getProblemEntryHandler,
  lookupProblemEntryStatusHandler,
  createProblemEntryHandler,
  updateProblemEntryHandler,
  getEscalatedEntriesHandler,
  createEscalatedEntryHandler,
]
