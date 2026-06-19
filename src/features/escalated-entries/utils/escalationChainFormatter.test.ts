import { describe, expect, it } from 'vitest'

import { formatEscalationChain } from './escalationChainFormatter'

describe('formatEscalationChain', () => {
  it('returns the escalationChain string verbatim when non-null', () => {
    const result = formatEscalationChain('Project Y → Program X', 'Program', 'Alpha Program')
    expect(result).toBe('Project Y → Program X')
  })

  it('returns scopeType + scopeName fallback when escalationChain is null', () => {
    const result = formatEscalationChain(null, 'Program', 'Alpha Program')
    expect(result).toBe('Program Alpha Program')
  })

  it('returns scopeType + scopeName fallback when escalationChain is null for Portfolio', () => {
    const result = formatEscalationChain(null, 'Portfolio', 'Beta Portfolio')
    expect(result).toBe('Portfolio Beta Portfolio')
  })

  it('handles an empty escalationChain string as falsy (returns verbatim)', () => {
    const result = formatEscalationChain('', 'Program', 'Alpha Program')
    expect(result).toBe('')
  })
})
