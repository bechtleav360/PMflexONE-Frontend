import { describe, expect, it } from 'vitest'

import {
  DeEscalateEntryFormSchema,
  EscalateEntryFormSchema,
  UpdateAssessmentFormSchema,
} from './escalationSchemas'

describe('EscalateEntryFormSchema', () => {
  it('accepts a non-empty reason', () => {
    const result = EscalateEntryFormSchema.safeParse({
      reason: 'Budget overrun requires escalation',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty reason string', () => {
    const result = EscalateEntryFormSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a whitespace-only reason', () => {
    const result = EscalateEntryFormSchema.safeParse({ reason: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing reason field', () => {
    const result = EscalateEntryFormSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('DeEscalateEntryFormSchema', () => {
  it('accepts a non-empty reason', () => {
    const result = DeEscalateEntryFormSchema.safeParse({
      reason: 'Issue resolved at project level',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty reason string', () => {
    const result = DeEscalateEntryFormSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a whitespace-only reason', () => {
    const result = DeEscalateEntryFormSchema.safeParse({ reason: '\t' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing reason field', () => {
    const result = DeEscalateEntryFormSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('UpdateAssessmentFormSchema', () => {
  it('accepts both optional int fields absent', () => {
    const result = UpdateAssessmentFormSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts valid targetProbability integer', () => {
    const result = UpdateAssessmentFormSchema.safeParse({ targetProbability: 3 })
    expect(result.success).toBe(true)
  })

  it('accepts valid targetImpact integer', () => {
    const result = UpdateAssessmentFormSchema.safeParse({ targetImpact: 4 })
    expect(result.success).toBe(true)
  })

  it('accepts both fields provided', () => {
    const result = UpdateAssessmentFormSchema.safeParse({ targetProbability: 2, targetImpact: 5 })
    expect(result.success).toBe(true)
  })

  it('rejects a non-integer targetProbability', () => {
    const result = UpdateAssessmentFormSchema.safeParse({ targetProbability: 2.5 })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer targetImpact', () => {
    const result = UpdateAssessmentFormSchema.safeParse({ targetImpact: 3.7 })
    expect(result.success).toBe(false)
  })
})
