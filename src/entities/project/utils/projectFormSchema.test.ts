import { describe, expect, it } from 'vitest'

import { projectFormSchema } from './projectFormSchema'

const validInput = {
  name: 'My Project',
  sizeClassification: 'small' as const,
  startDate: new Date('2026-04-01'),
  endDate: new Date('2026-12-31'),
  description: '',
}

describe('projectFormSchema', () => {
  it('accepts a fully valid input', () => {
    expect(() => projectFormSchema.parse(validInput)).not.toThrow()
  })

  it('rejects an empty project name', () => {
    const result = projectFormSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a whitespace-only project name', () => {
    const result = projectFormSchema.safeParse({ ...validInput, name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing sizeClassification', () => {
    const result = projectFormSchema.safeParse({ ...validInput, sizeClassification: undefined })
    expect(result.success).toBe(false)
  })

  it('rejects a null startDate', () => {
    const result = projectFormSchema.safeParse({ ...validInput, startDate: null })
    expect(result.success).toBe(false)
  })

  it('rejects a null endDate', () => {
    const result = projectFormSchema.safeParse({ ...validInput, endDate: null })
    expect(result.success).toBe(false)
  })

  it('rejects endDate earlier than startDate', () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-05-31'),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(
        messages.some(
          (m) => m.includes('end date') || m.includes('endDate') || m.includes('End date'),
        ),
      ).toBe(true)
    }
  })

  it('accepts endDate equal to startDate', () => {
    const date = new Date('2026-06-01')
    expect(() =>
      projectFormSchema.parse({ ...validInput, startDate: date, endDate: date }),
    ).not.toThrow()
  })

  it('accepts an empty description (optional field)', () => {
    expect(() => projectFormSchema.parse({ ...validInput, description: '' })).not.toThrow()
  })

  it('accepts a non-empty description', () => {
    expect(() =>
      projectFormSchema.parse({ ...validInput, description: '# Context\nSome details.' }),
    ).not.toThrow()
  })
})
