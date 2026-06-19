import { describe, expect, it } from 'vitest'

import { proj1 } from '@/shared/test-utils/fixtures'

import { draftSchema, submitSchema } from './projectInitiationRequestSchema'

const validDraft = {
  name: 'Digitalisierung Rechnungswesen',
  requestingProjectId: proj1,
  scopeType: 'Program' as const,
  scopeId: 'scope-1',
}

const validSubmit = {
  ...validDraft,
  documentVersion: '1.0',
  projectInitiator: 'Max Mustermann',
  projectOwner: 'Erika Mustermann',
  organizationalUnit: 'IT',
  approvalAuthority: 'PMO',
  requestDate: '2026-01-01',
  targetDeliveryDate: '2026-12-31',
  deliveryType: 'internal',
}

describe('draftSchema', () => {
  it('accepts minimal valid input (name + requestingProjectId only)', () => {
    expect(() => draftSchema.parse(validDraft)).not.toThrow()
  })

  it('rejects an empty name', () => {
    const result = draftSchema.safeParse({ ...validDraft, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a whitespace-only name', () => {
    const result = draftSchema.safeParse({ ...validDraft, name: '   ' })
    expect(result.success).toBe(false)
  })

  it('accepts a name at exactly 500 characters', () => {
    const result = draftSchema.safeParse({ ...validDraft, name: 'a'.repeat(500) })
    expect(result.success).toBe(true)
  })

  it('rejects a name exceeding 500 characters', () => {
    const result = draftSchema.safeParse({ ...validDraft, name: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('requires requestingProjectId', () => {
    const result = draftSchema.safeParse({ ...validDraft, requestingProjectId: '' })
    expect(result.success).toBe(false)
  })

  it('treats documentVersion as optional, defaulting to empty string', () => {
    const result = draftSchema.safeParse({ ...validDraft })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.documentVersion).toBe('')
    }
  })

  it('treats personnel string fields as optional, defaulting to null', () => {
    const result = draftSchema.safeParse({ ...validDraft })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectInitiator).toBeNull()
      expect(result.data.projectOwner).toBeNull()
      expect(result.data.organizationalUnit).toBeNull()
      expect(result.data.solutionProvider).toBeNull()
      expect(result.data.approvalAuthority).toBeNull()
    }
  })

  it('rejects an invalid deliveryType enum value', () => {
    const result = draftSchema.safeParse({ ...validDraft, deliveryType: 'bogus' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid deliveryType values', () => {
    for (const value of ['internal', 'external', 'mixed', 'unknown']) {
      expect(draftSchema.safeParse({ ...validDraft, deliveryType: value }).success).toBe(true)
    }
  })

  it('rejects a requestDate with non-ISO format', () => {
    const result = draftSchema.safeParse({ ...validDraft, requestDate: '20/04/2026' })
    expect(result.success).toBe(false)
  })

  it('accepts a requestDate in YYYY-MM-DD format', () => {
    const result = draftSchema.safeParse({ ...validDraft, requestDate: '2026-04-20' })
    expect(result.success).toBe(true)
  })

  it('rejects a negative estimatedEffort', () => {
    const result = draftSchema.safeParse({ ...validDraft, estimatedEffort: -1 })
    expect(result.success).toBe(false)
  })

  it('accepts a positive estimatedEffort', () => {
    const result = draftSchema.safeParse({ ...validDraft, estimatedEffort: 10 })
    expect(result.success).toBe(true)
  })
})

describe('submitSchema', () => {
  it('accepts a fully valid submit input', () => {
    expect(() => submitSchema.parse(validSubmit)).not.toThrow()
  })

  it('requires documentVersion (min 1)', () => {
    const result = submitSchema.safeParse({ ...validSubmit, documentVersion: '' })
    expect(result.success).toBe(false)
  })

  it('requires requestingProjectId', () => {
    const result = submitSchema.safeParse({ ...validSubmit, requestingProjectId: '' })
    expect(result.success).toBe(false)
  })

  it('requires name', () => {
    const result = submitSchema.safeParse({ ...validSubmit, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects null projectInitiator', () => {
    const result = submitSchema.safeParse({ ...validSubmit, projectInitiator: null })
    expect(result.success).toBe(false)
  })

  it('rejects null projectOwner', () => {
    const result = submitSchema.safeParse({ ...validSubmit, projectOwner: null })
    expect(result.success).toBe(false)
  })

  it('rejects null organizationalUnit', () => {
    const result = submitSchema.safeParse({ ...validSubmit, organizationalUnit: null })
    expect(result.success).toBe(false)
  })

  it('rejects null approvalAuthority', () => {
    const result = submitSchema.safeParse({ ...validSubmit, approvalAuthority: null })
    expect(result.success).toBe(false)
  })

  it('rejects null targetDeliveryDate', () => {
    const result = submitSchema.safeParse({ ...validSubmit, targetDeliveryDate: null })
    expect(result.success).toBe(false)
  })

  it('rejects null deliveryType', () => {
    const result = submitSchema.safeParse({ ...validSubmit, deliveryType: null })
    expect(result.success).toBe(false)
  })
})
