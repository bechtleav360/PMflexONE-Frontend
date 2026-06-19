import { describe, expect, it } from 'vitest'

import { generateInitials } from './generateInitials'

describe('generateInitials', () => {
  it('returns uppercased initials from first and last name', () => {
    expect(generateInitials('Felix', 'Müller')).toBe('FMÜ')
  })

  it('returns first char of firstName and up to 2 chars of lastName', () => {
    expect(generateInitials('John', 'Doe')).toBe('JDO')
  })

  it('handles null firstName', () => {
    expect(generateInitials(null, 'Smith')).toBe('SM')
  })

  it('handles null lastName', () => {
    expect(generateInitials('Alice', null)).toBe('A')
  })

  it('handles both null', () => {
    expect(generateInitials(null, null)).toBe('')
  })

  it('trims whitespace from names', () => {
    expect(generateInitials('  Jane  ', '  Doe  ')).toBe('JDO')
  })

  it('takes only first 2 chars of lastName', () => {
    expect(generateInitials('A', 'Brown')).toBe('ABR')
  })
})
