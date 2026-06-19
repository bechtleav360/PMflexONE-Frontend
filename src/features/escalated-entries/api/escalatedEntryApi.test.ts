import { describe, expect, it } from 'vitest'

import {
  DE_ESCALATE_ENTRY,
  deEscalateEntryResponseSchema,
  ESCALATE_ENTRY,
  escalateEntryResponseSchema,
  GET_ESCALATED_ENTRIES,
  GET_ESCALATED_ENTRY,
  getEscalatedEntriesResponseSchema,
  getEscalatedEntryResponseSchema,
} from './escalatedEntryApi'

const sampleListEntry = {
  id: 'ee-1',
  version: 1,
  sourceEntryType: 'RISK',
  sourceEntryId: 'r-1',
  scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' },
  escalationChain: null,
  status: 'ACTIVE',
  entryNumber: 'R-001',
  name: 'Budget risk',
  description: null,
  pestelCategory: 'ECONOMIC',
  sourceStatus: 'proposed',
  probability: 3,
  impact: 4,
  riskLevel: 12,
  targetProbability: null,
  targetImpact: null,
  escalatedAt: '2024-01-15T00:00:00Z',
  returnedAt: null,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
  updater: null,
}

const sampleDetailEntry = {
  ...sampleListEntry,
  escalationProtocol: [
    {
      id: 'ev-1',
      version: 1,
      eventType: 'ESCALATION',
      reason: 'Critical budget overrun',
      occurredAt: '2024-01-15T00:00:00Z',
      performedBy: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
    },
  ],
  measures: [
    {
      id: 'm-1',
      version: 1,
      content: 'Review budget allocations',
      position: 0,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
    },
  ],
}

describe('getEscalatedEntriesResponseSchema', () => {
  it('parses a valid list response', () => {
    const result = getEscalatedEntriesResponseSchema.parse({
      escalatedEntries: [sampleListEntry],
    })
    expect(result.escalatedEntries).toHaveLength(1)
    expect(result.escalatedEntries[0].id).toBe('ee-1')
    expect(result.escalatedEntries[0].status).toBe('ACTIVE')
  })

  it('parses an empty list response', () => {
    const result = getEscalatedEntriesResponseSchema.parse({ escalatedEntries: [] })
    expect(result.escalatedEntries).toHaveLength(0)
  })

  it('rejects a response missing escalatedEntries', () => {
    expect(() => getEscalatedEntriesResponseSchema.parse({})).toThrow()
  })

  it('rejects an entry missing required id field', () => {
    const invalid = { ...sampleListEntry }
    delete (invalid as Record<string, unknown>).id
    expect(() => getEscalatedEntriesResponseSchema.parse({ escalatedEntries: [invalid] })).toThrow()
  })

  it('rejects an invalid status value', () => {
    const invalid = { ...sampleListEntry, status: 'INVALID_STATUS' }
    expect(() => getEscalatedEntriesResponseSchema.parse({ escalatedEntries: [invalid] })).toThrow()
  })

  it('accepts null escalationChain', () => {
    const result = getEscalatedEntriesResponseSchema.parse({
      escalatedEntries: [{ ...sampleListEntry, escalationChain: null }],
    })
    expect(result.escalatedEntries[0].escalationChain).toBeNull()
  })

  it('accepts a non-null escalationChain string', () => {
    const result = getEscalatedEntriesResponseSchema.parse({
      escalatedEntries: [{ ...sampleListEntry, escalationChain: 'Project Y → Program X' }],
    })
    expect(result.escalatedEntries[0].escalationChain).toBe('Project Y → Program X')
  })
})

describe('getEscalatedEntryResponseSchema', () => {
  it('parses a valid single entry with protocol and measures', () => {
    const result = getEscalatedEntryResponseSchema.parse({ escalatedEntry: sampleDetailEntry })
    expect(result.escalatedEntry?.id).toBe('ee-1')
    expect(result.escalatedEntry?.escalationProtocol).toHaveLength(1)
    expect(result.escalatedEntry?.measures).toHaveLength(1)
  })

  it('parses a null escalatedEntry', () => {
    const result = getEscalatedEntryResponseSchema.parse({ escalatedEntry: null })
    expect(result.escalatedEntry).toBeNull()
  })

  it('rejects a protocol event missing required occurredAt', () => {
    const invalid = {
      ...sampleDetailEntry,
      escalationProtocol: [{ ...sampleDetailEntry.escalationProtocol[0], occurredAt: undefined }],
    }
    expect(() => getEscalatedEntryResponseSchema.parse({ escalatedEntry: invalid })).toThrow()
  })
})

describe('escalateEntryResponseSchema', () => {
  it('parses a valid mutation response', () => {
    const result = escalateEntryResponseSchema.parse({
      createEscalatedEntry: {
        id: 'ee-2',
        version: 1,
        status: 'ACTIVE',
        escalatedAt: '2024-01-16T00:00:00Z',
        sourceEntryId: 'r-2',
        sourceEntryType: 'RISK',
        scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' },
        escalationChain: null,
        entryNumber: 'R-002',
        name: 'Scope creep',
      },
    })
    expect(result.createEscalatedEntry.id).toBe('ee-2')
  })
})

describe('deEscalateEntryResponseSchema', () => {
  it('parses a valid de-escalation response', () => {
    const result = deEscalateEntryResponseSchema.parse({
      deEscalateEntry: {
        id: 'ee-1',
        version: 2,
        status: 'RETURNED',
        returnedAt: '2024-01-20T00:00:00Z',
      },
    })
    expect(result.deEscalateEntry.status).toBe('RETURNED')
  })
})

describe('GraphQL document shapes', () => {
  it('GET_ESCALATED_ENTRIES contains the query name', () => {
    expect(String(GET_ESCALATED_ENTRIES)).toContain('GetEscalatedEntries')
  })

  it('GET_ESCALATED_ENTRY contains the query name', () => {
    expect(String(GET_ESCALATED_ENTRY)).toContain('GetEscalatedEntry')
  })

  it('ESCALATE_ENTRY contains the mutation name', () => {
    expect(String(ESCALATE_ENTRY)).toContain('EscalateEntry')
  })

  it('DE_ESCALATE_ENTRY contains the mutation name', () => {
    expect(String(DE_ESCALATE_ENTRY)).toContain('DeEscalateEntry')
  })
})
