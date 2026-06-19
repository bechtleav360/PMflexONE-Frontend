import { describe, expect, it } from 'vitest'

import { assumptionFormSchema } from './assumptionSchema'
import { constraintFormSchema } from './constraintSchema'
import { goalFormSchema } from './goalSchema'
import { requirementFormSchema } from './requirementSchema'

// ---------------------------------------------------------------------------
// goalFormSchema
// ---------------------------------------------------------------------------

describe('goalFormSchema', () => {
  it('passes with minimal valid input', () => {
    const result = goalFormSchema.safeParse({ name: 'Goal A' })
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = goalFormSchema.safeParse({ name: '   ' })
    expect(result.success).toBe(false)
  })

  it('fails when name exceeds 500 chars', () => {
    const result = goalFormSchema.safeParse({ name: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('fails when progress is out of range', () => {
    expect(goalFormSchema.safeParse({ name: 'G', progress: -1 }).success).toBe(false)
    expect(goalFormSchema.safeParse({ name: 'G', progress: 101 }).success).toBe(false)
  })

  it('passes when progress is 0 or 100', () => {
    expect(goalFormSchema.safeParse({ name: 'G', progress: 0 }).success).toBe(true)
    expect(goalFormSchema.safeParse({ name: 'G', progress: 100 }).success).toBe(true)
  })

  it('fails when dueDate has wrong format', () => {
    expect(goalFormSchema.safeParse({ name: 'G', dueDate: '2024/01/01' }).success).toBe(false)
    expect(goalFormSchema.safeParse({ name: 'G', dueDate: '20240101' }).success).toBe(false)
  })

  it('passes when dueDate is ISO format or null', () => {
    expect(goalFormSchema.safeParse({ name: 'G', dueDate: '2024-01-01' }).success).toBe(true)
    expect(goalFormSchema.safeParse({ name: 'G', dueDate: null }).success).toBe(true)
  })

  it('fails when acceptedAt has wrong format', () => {
    expect(goalFormSchema.safeParse({ name: 'G', acceptedAt: '01-01-2024' }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// requirementFormSchema
// ---------------------------------------------------------------------------

const validRequirement = {
  name: 'Req A',
  requirementScope: 'IN_SCOPE' as const,
  source: 'INTERNAL' as const,
  type: 'FUNCTIONAL' as const,
  priority: 'MUST_HAVE' as const,
  status: 'NEW' as const,
}

describe('requirementFormSchema', () => {
  it('passes with valid minimal input', () => {
    expect(requirementFormSchema.safeParse(validRequirement).success).toBe(true)
  })

  it('fails when name is empty', () => {
    expect(requirementFormSchema.safeParse({ ...validRequirement, name: '' }).success).toBe(false)
  })

  it('fails when requirementScope is invalid', () => {
    expect(
      requirementFormSchema.safeParse({ ...validRequirement, requirementScope: 'UNKNOWN' }).success,
    ).toBe(false)
  })

  it('fails when estimatedEffortMin > estimatedEffortMax', () => {
    const result = requirementFormSchema.safeParse({
      ...validRequirement,
      estimatedEffortMin: 10,
      estimatedEffortMax: 5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('estimatedEffortMax')
      expect(result.error.issues[0].message).toBe(
        'features.planningObjects.validation.effortMinGtMax',
      )
    }
  })

  it('passes when estimatedEffortMin === estimatedEffortMax', () => {
    expect(
      requirementFormSchema.safeParse({
        ...validRequirement,
        estimatedEffortMin: 5,
        estimatedEffortMax: 5,
      }).success,
    ).toBe(true)
  })

  it('passes when estimatedEffortMin < estimatedEffortMax', () => {
    expect(
      requirementFormSchema.safeParse({
        ...validRequirement,
        estimatedEffortMin: 3,
        estimatedEffortMax: 8,
      }).success,
    ).toBe(true)
  })

  it('passes when only estimatedEffortMin is set', () => {
    expect(
      requirementFormSchema.safeParse({
        ...validRequirement,
        estimatedEffortMin: 5,
        estimatedEffortMax: null,
      }).success,
    ).toBe(true)
  })

  it('passes when only estimatedEffortMax is set', () => {
    expect(
      requirementFormSchema.safeParse({
        ...validRequirement,
        estimatedEffortMin: null,
        estimatedEffortMax: 10,
      }).success,
    ).toBe(true)
  })

  it('fails when priority is invalid', () => {
    expect(
      requirementFormSchema.safeParse({ ...validRequirement, priority: 'NICE_TO_HAVE' }).success,
    ).toBe(false)
  })

  it('fails when status is invalid', () => {
    expect(requirementFormSchema.safeParse({ ...validRequirement, status: 'DONE' }).success).toBe(
      false,
    )
  })
})

// ---------------------------------------------------------------------------
// assumptionFormSchema
// ---------------------------------------------------------------------------

describe('assumptionFormSchema', () => {
  const valid = { name: 'Assumption A', validationStatus: 'OPEN', isRisk: false }

  it('passes with valid input', () => {
    expect(assumptionFormSchema.safeParse(valid).success).toBe(true)
  })

  it('fails when name is empty', () => {
    expect(assumptionFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('fails when validationStatus is empty', () => {
    expect(assumptionFormSchema.safeParse({ ...valid, validationStatus: '' }).success).toBe(false)
  })

  it('accepts isRisk: false as valid boolean', () => {
    const result = assumptionFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isRisk).toBe(false)
    }
  })

  it('fails when dueDate has wrong format', () => {
    expect(assumptionFormSchema.safeParse({ ...valid, dueDate: '01/01/2024' }).success).toBe(false)
  })

  it('passes when dueDate is null', () => {
    expect(assumptionFormSchema.safeParse({ ...valid, dueDate: null }).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// constraintFormSchema
// ---------------------------------------------------------------------------

describe('constraintFormSchema', () => {
  const valid = { name: 'Constraint A', timeConstrained: false }

  it('passes with valid input', () => {
    expect(constraintFormSchema.safeParse(valid).success).toBe(true)
  })

  it('fails when name is empty', () => {
    expect(constraintFormSchema.safeParse({ name: '', timeConstrained: false }).success).toBe(false)
  })

  it('accepts timeConstrained: false as valid boolean', () => {
    const result = constraintFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.timeConstrained).toBe(false)
    }
  })

  it('fails when dueDate has wrong format', () => {
    expect(constraintFormSchema.safeParse({ ...valid, dueDate: '2024.01.01' }).success).toBe(false)
  })

  it('passes when dueDate is ISO format', () => {
    expect(constraintFormSchema.safeParse({ ...valid, dueDate: '2024-06-15' }).success).toBe(true)
  })
})
