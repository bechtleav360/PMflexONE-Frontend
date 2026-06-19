import { describe, expect, it } from 'vitest'

import { portfolioSchema } from './portfolioSchema'

describe('portfolioSchema — name', () => {
  it('accepts a valid name', () => {
    const result = portfolioSchema.safeParse({
      name: 'Digital Transformation',
      startYear: null,
      endYear: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = portfolioSchema.safeParse({ name: '', startYear: null, endYear: null })
    expect(result.success).toBe(false)
  })

  it('rejects a whitespace-only name', () => {
    const result = portfolioSchema.safeParse({ name: '   ', startYear: null, endYear: null })
    expect(result.success).toBe(false)
  })

  it('rejects a name exceeding 255 characters', () => {
    const result = portfolioSchema.safeParse({
      name: 'a'.repeat(256),
      startYear: null,
      endYear: null,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.code).toBe('too_big')
    }
  })

  it('accepts a name of exactly 255 characters', () => {
    const result = portfolioSchema.safeParse({
      name: 'a'.repeat(255),
      startYear: null,
      endYear: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('portfolioSchema — year range', () => {
  it('accepts when both years are null', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: null, endYear: null })
    expect(result.success).toBe(true)
  })

  it('accepts when only startYear is set', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: 2026, endYear: null })
    expect(result.success).toBe(true)
  })

  it('accepts when only endYear is set', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: null, endYear: 2028 })
    expect(result.success).toBe(true)
  })

  it('accepts when endYear equals startYear', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: 2026, endYear: 2026 })
    expect(result.success).toBe(true)
  })

  it('accepts when endYear is greater than startYear', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: 2026, endYear: 2030 })
    expect(result.success).toBe(true)
  })

  it('rejects when endYear is less than startYear', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: 2030, endYear: 2026 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('endYear')
      expect(result.error.issues[0]?.message).toBe('yearRangeInvalid')
    }
  })

  it('rejects a year outside the 1000–9999 range', () => {
    const result = portfolioSchema.safeParse({ name: 'Test', startYear: 999, endYear: null })
    expect(result.success).toBe(false)
  })
})
