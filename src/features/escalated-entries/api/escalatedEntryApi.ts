import { z } from 'zod'

export {
  GET_ESCALATED_ENTRIES,
  GET_ESCALATED_ENTRY,
  ESCALATE_ENTRY,
  DE_ESCALATE_ENTRY,
  UPDATE_ESCALATED_ENTRY,
  CREATE_ESCALATION_MEASURE,
  UPDATE_ESCALATION_MEASURE,
  DELETE_ESCALATION_MEASURE,
} from './escalatedEntryGql'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const personSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  mail: z.string(),
})

const escalationEventSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  eventType: z.enum(['ESCALATION', 'DE_ESCALATION']),
  reason: z.string(),
  occurredAt: z.string(),
  performedBy: personSchema,
})

const escalationMeasureSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  content: z.string(),
  position: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
})

const escalatedEntryBaseSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  sourceEntryType: z.enum(['RISK', 'OPPORTUNITY', 'PROBLEM', 'ISSUE']),
  sourceEntryId: z.string(),
  scope: z.object({ id: z.string(), scopeType: z.enum(['Program', 'Portfolio']) }).nullable(),
  escalationChain: z.string().nullable(),
  status: z.enum(['ACTIVE', 'RETURNED', 'ESCALATED']),
  entryNumber: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  pestelCategory: z
    .enum(['POLITICAL', 'ECONOMIC', 'SOCIAL', 'TECHNOLOGICAL', 'ENVIRONMENTAL', 'LEGAL'])
    .nullable(),
  sourceStatus: z.string().nullable(),
  probability: z.number().int().nullable(),
  impact: z.number().int().nullable(),
  riskLevel: z.number().int().nullable(),
  targetProbability: z.number().int().nullable(),
  targetImpact: z.number().int().nullable(),
  escalatedAt: z.string(),
  returnedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: personSchema.nullable(),
  updater: personSchema.nullable(),
})

const childEntrySchema = z.object({
  id: z.string(),
  escalationProtocol: z.array(escalationEventSchema),
  targetProbability: z.number().int().nullable(),
  targetImpact: z.number().int().nullable(),
  measures: z.array(escalationMeasureSchema),
})

const parentEntrySchema = z.object({
  id: z.string(),
  escalationProtocol: z.array(escalationEventSchema),
  targetProbability: z.number().int().nullable(),
  targetImpact: z.number().int().nullable(),
  measures: z.array(escalationMeasureSchema),
})

const escalatedEntryDetailSchema = escalatedEntryBaseSchema.extend({
  escalationProtocol: z.array(escalationEventSchema),
  measures: z.array(escalationMeasureSchema),
  parentEntry: parentEntrySchema.nullable().optional(),
  childEntry: childEntrySchema.nullable().optional(),
})

// ─── Response schemas ──────────────────────────────────────────────────────────

/** Zod schema for the GET_ESCALATED_ENTRIES response. */
export const getEscalatedEntriesResponseSchema = z.object({
  escalatedEntries: z.array(escalatedEntryBaseSchema),
})

/** Zod schema for the GET_ESCALATED_ENTRY response. */
export const getEscalatedEntryResponseSchema = z.object({
  escalatedEntry: escalatedEntryDetailSchema.nullable(),
})

/** Zod schema for the ESCALATE_ENTRY mutation response. */
export const escalateEntryResponseSchema = z.object({
  createEscalatedEntry: z.object({
    id: z.string(),
    version: z.number().int(),
    status: z.enum(['ACTIVE', 'RETURNED', 'ESCALATED']),
    escalatedAt: z.string(),
    sourceEntryId: z.string(),
    sourceEntryType: z.enum(['RISK', 'OPPORTUNITY', 'PROBLEM', 'ISSUE']),
    scope: z.object({ id: z.string(), scopeType: z.enum(['Program', 'Portfolio']) }).nullable(),
    escalationChain: z.string().nullable(),
    entryNumber: z.string(),
    name: z.string(),
  }),
})

/** Zod schema for the DE_ESCALATE_ENTRY mutation response. */
export const deEscalateEntryResponseSchema = z.object({
  deEscalateEntry: z.object({
    id: z.string(),
    version: z.number().int(),
    status: z.enum(['ACTIVE', 'RETURNED', 'ESCALATED']),
    returnedAt: z.string().nullable(),
  }),
})

/** Zod schema for the UPDATE_ESCALATED_ENTRY mutation response. */
export const updateEscalatedEntryResponseSchema = z.object({
  updateEscalatedEntry: z.object({
    id: z.string(),
    version: z.number().int(),
    targetProbability: z.number().int().nullable(),
    targetImpact: z.number().int().nullable(),
    updatedAt: z.string(),
  }),
})

/** Zod schema for the CREATE_ESCALATION_MEASURE mutation response. */
export const createEscalationMeasureResponseSchema = z.object({
  createEscalationMeasure: escalationMeasureSchema,
})

/** Zod schema for the UPDATE_ESCALATION_MEASURE mutation response. */
export const updateEscalationMeasureResponseSchema = z.object({
  updateEscalationMeasure: z.object({
    id: z.string(),
    version: z.number().int(),
    content: z.string(),
    position: z.number().int().nullable(),
    updatedAt: z.string(),
  }),
})

/** Zod schema for the DELETE_ESCALATION_MEASURE mutation response. */
export const deleteEscalationMeasureResponseSchema = z.object({
  deleteEscalationMeasure: z.boolean(),
})

// ─── Query key factories ───────────────────────────────────────────────────────

/**
 * TanStack Query key factory for the escalated entries list.
 *
 * @param scopeId - The program or portfolio ID.
 * @param scopeType - 'Program' or 'Portfolio'.
 * @param sourceEntryType - Optional filter by source entry type.
 * @returns A readonly query key tuple scoped to the given filters.
 */
export const ESCALATED_ENTRIES_QUERY_KEY = (
  scopeId: string,
  scopeType: string,
  sourceEntryType?: string,
) => ['escalatedEntries', scopeId, scopeType, sourceEntryType] as const

/**
 * TanStack Query key factory for a single escalated entry.
 *
 * @param id - The escalated entry ID.
 * @returns A readonly query key tuple for the given entry.
 */
export const ESCALATED_ENTRY_QUERY_KEY = (id: string) => ['escalatedEntry', id] as const
