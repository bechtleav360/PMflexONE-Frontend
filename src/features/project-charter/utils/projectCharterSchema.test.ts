import { describe, expect, it } from 'vitest'

import { projectCharterSchema } from './projectCharterSchema'

describe('projectCharterSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(() => projectCharterSchema.parse({})).not.toThrow()
  })

  it('accepts string values for all 10 content fields', () => {
    const result = projectCharterSchema.safeParse({
      projectSummary: 'Summary',
      scopeSummary: 'Scope',
      successCriteria: 'Criteria',
      stakeholders: 'Stakeholders',
      requirement: 'Requirements',
      projectConstraint: 'Constraints',
      assumption: 'Assumptions',
      risk: 'Risks',
      resources: 'Resources',
      operationalImplementation: 'Implementation',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a partial object with only some fields set', () => {
    const result = projectCharterSchema.safeParse({ projectSummary: 'Some summary' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectSummary).toBe('Some summary')
      expect(result.data.scopeSummary).toBeUndefined()
    }
  })

  it('rejects a number value for a content field', () => {
    const result = projectCharterSchema.safeParse({ projectSummary: 42 })
    expect(result.success).toBe(false)
  })

  it('rejects a boolean value for a content field', () => {
    const result = projectCharterSchema.safeParse({ risk: true })
    expect(result.success).toBe(false)
  })

  it('infers ProjectCharterFormValues type with all fields optional', () => {
    const values: ReturnType<typeof projectCharterSchema.parse> = {}
    expect(values).toBeDefined()
  })
})
