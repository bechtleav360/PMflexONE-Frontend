/** Lifecycle state of an escalated entry at the target level. */
export type EscalationStatus = 'ACTIVE' | 'RETURNED' | 'ESCALATED'

/** Discriminates entries in the escalation protocol. */
export type EscalationEventType = 'ESCALATION' | 'DE_ESCALATION'

/** Type of the originating governance entry. */
export type SourceEntryType = 'RISK' | 'OPPORTUNITY' | 'PROBLEM' | 'ISSUE'

/** Scope level of the entity holding the escalated entry. */
export type EscalationScopeType = 'Program' | 'Portfolio'

/** PESTEL classification. */
export type PestelCategory =
  | 'POLITICAL'
  | 'ECONOMIC'
  | 'SOCIAL'
  | 'TECHNOLOGICAL'
  | 'ENVIRONMENTAL'
  | 'LEGAL'

/** A person reference (e.g. creator, updater, performedBy). */
export interface Person {
  id: string
  firstName: string
  lastName: string
  mail: string
}

/** A single audit record for one escalation or de-escalation action. */
export interface EscalationEvent {
  id: string
  version: number
  eventType: EscalationEventType
  reason: string
  occurredAt: string
  performedBy: Person
}

/** A single ordered free-text action item in the target-level action list. */
export interface EscalationMeasure {
  id: string
  version: number
  content: string
  position: number | null
  createdAt: string
  updatedAt: string
  creator: Person | null
}

/** The snapshot copy of a source entry placed at the target level upon escalation. */
export interface EscalatedEntry {
  id: string
  version: number
  sourceEntryType: SourceEntryType
  sourceEntryId: string
  scope: { id: string; scopeType: EscalationScopeType } | null
  escalationChain: string | null
  status: EscalationStatus
  entryNumber: string
  name: string
  description: string | null
  pestelCategory: PestelCategory | null
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
  creator: Person | null
  updater: Person | null
  escalationProtocol: EscalationEvent[]
  measures: EscalationMeasure[]
  childEntry?: {
    id: string
    escalationProtocol: EscalationEvent[]
    targetProbability: number | null
    targetImpact: number | null
    measures: EscalationMeasure[]
  } | null
  parentEntry?: {
    id: string
    escalationProtocol: EscalationEvent[]
    targetProbability: number | null
    targetImpact: number | null
    measures: EscalationMeasure[]
  } | null
}

/** Subset of EscalatedEntry returned by the list query (no protocol/measures). */
export type EscalatedEntryListItem = Omit<EscalatedEntry, 'escalationProtocol' | 'measures'>

/** Extension fields added to source register entries. */
export interface ActiveEscalationRef {
  id: string
  status: EscalationStatus
  scope: { id: string; scopeType: EscalationScopeType } | null
  escalatedAt: string
}

/** Filter input for the escalatedEntries query. */
export interface EscalatedEntryFilter {
  scopeId: string
  scopeType: EscalationScopeType
  sourceEntryType?: SourceEntryType
  status?: EscalationStatus
  id?: string
  sourceEntryId?: string
  entryNumber?: string
  name?: string
  pestelCategory?: PestelCategory
  escalationChain?: string
}

/** Input for the createEscalatedEntry mutation. */
export interface EscalateEntryInput {
  sourceEntryId: string
  sourceEntryType: SourceEntryType
  reason: string
  metadata?: string
}

/** Input for the deEscalateEntry mutation. */
export interface DeEscalateEntryInput {
  id: string
  version: number
  reason: string
}

/** Input for the updateEscalatedEntry mutation. */
export interface UpdateEscalatedEntryAssessmentInput {
  id: string
  version: number
  targetProbability?: number
  targetImpact?: number
}

/** Input for the createEscalationMeasure mutation. */
export interface AddEscalationMeasureInput {
  escalatedEntryId: string
  content: string
  position?: number
  metadata?: string
}

/** Input for the updateEscalationMeasure mutation. */
export interface UpdateEscalationMeasureInput {
  id: string
  version: number
  content?: string
  position?: number
}
