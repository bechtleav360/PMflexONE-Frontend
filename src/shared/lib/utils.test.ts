import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting Tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional values', () => {
    expect(cn('base', false, 'extra')).toBe('base extra')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})
