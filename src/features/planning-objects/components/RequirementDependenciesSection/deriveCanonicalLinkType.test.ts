import { describe, expect, it } from 'vitest'

import { deriveCanonicalLinkType } from './deriveCanonicalLinkType'

describe('deriveCanonicalLinkType', () => {
  it('blocks → blocks', () => {
    expect(deriveCanonicalLinkType('blocks')).toBe('blocks')
  })

  it('blocked_by → blocks', () => {
    expect(deriveCanonicalLinkType('blocked_by')).toBe('blocks')
  })

  it('duplicates → duplicates', () => {
    expect(deriveCanonicalLinkType('duplicates')).toBe('duplicates')
  })

  it('duplicated_by → duplicates', () => {
    expect(deriveCanonicalLinkType('duplicated_by')).toBe('duplicates')
  })

  it('relates_to → relates_to', () => {
    expect(deriveCanonicalLinkType('relates_to')).toBe('relates_to')
  })
})
