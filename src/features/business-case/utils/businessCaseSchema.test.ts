import { describe, expect, it } from 'vitest'

import { businessCaseSchema } from './businessCaseSchema'

describe('businessCaseSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(() => businessCaseSchema.parse({})).not.toThrow()
  })

  it('accepts string values for all 8 content fields', () => {
    const result = businessCaseSchema.safeParse({
      clientSummary: 'Summary',
      projectRationale: 'Rationale',
      expectedBenefit: 'Benefit',
      options: 'Option A',
      investmentCalculation: '450.000 €',
      keyRisks: 'Risk 1',
      expectedNegativeSideEffect: 'Side effect',
      timeline: 'Q3 2026',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a partial object with only some fields set', () => {
    const result = businessCaseSchema.safeParse({ projectRationale: 'Some rationale' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectRationale).toBe('Some rationale')
      expect(result.data.clientSummary).toBeUndefined()
    }
  })

  it('rejects a number value for a content field', () => {
    const result = businessCaseSchema.safeParse({ clientSummary: 42 })
    expect(result.success).toBe(false)
  })

  it('rejects a boolean value for a content field', () => {
    const result = businessCaseSchema.safeParse({ keyRisks: true })
    expect(result.success).toBe(false)
  })

  it('infers BusinessCaseFormValues type with all fields optional', () => {
    // TypeScript type assertion — if schema is wrong this will fail to compile
    const values: ReturnType<typeof businessCaseSchema.parse> = {}
    expect(values).toBeDefined()
  })
})
