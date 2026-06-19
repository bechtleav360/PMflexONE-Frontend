import { describe, expect, it } from 'vitest'

import { toIsoDateString } from './dateUtils'

describe('toIsoDateString', () => {
  it('returns empty string for null', () => {
    expect(toIsoDateString(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(toIsoDateString(undefined)).toBe('')
  })

  it('formats a mid-year date with no padding needed', () => {
    expect(toIsoDateString(new Date(2024, 11, 31))).toBe('2024-12-31')
  })

  it('zero-pads single-digit month', () => {
    expect(toIsoDateString(new Date(2024, 5, 15))).toBe('2024-06-15')
  })

  it('zero-pads single-digit day', () => {
    expect(toIsoDateString(new Date(2023, 9, 9))).toBe('2023-10-09')
  })

  it('zero-pads both month and day when both are single-digit', () => {
    expect(toIsoDateString(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})
