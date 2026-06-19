import { describe, expect, it } from 'vitest'

import { stakeholderFormSchema } from './stakeholderSchema'

const validBase = {
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL' as const,
}

describe('stakeholderFormSchema', () => {
  it('accepts minimal valid input', () => {
    expect(() => stakeholderFormSchema.parse(validBase)).not.toThrow()
  })

  describe('name', () => {
    it('rejects empty name', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, name: '' })).toThrow()
    })
    it('rejects name exceeding 100 chars', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, name: 'a'.repeat(101) })).toThrow()
    })
    it('accepts name at exactly 100 chars', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, name: 'a'.repeat(100) }),
      ).not.toThrow()
    })
  })

  describe('role', () => {
    it('rejects empty role', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, role: '' })).toThrow()
    })
    it('rejects role exceeding 100 chars', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, role: 'a'.repeat(101) })).toThrow()
    })
  })

  describe('contactGroup', () => {
    it('rejects invalid contactGroup', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, contactGroup: 'INVALID' })).toThrow()
    })
  })

  describe('email', () => {
    it('rejects invalid email', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, email: 'not-an-email' })).toThrow()
    })
    it('accepts valid email', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, email: 'a@b.com' })).not.toThrow()
    })
    it('accepts null email', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, email: null })).not.toThrow()
    })
  })

  describe('phone', () => {
    it('rejects invalid phone', () => {
      expect(() => stakeholderFormSchema.parse({ ...validBase, phone: 'abc' })).toThrow()
    })
    it('accepts valid phone', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, phone: '+49 30 12345678' }),
      ).not.toThrow()
    })
  })

  describe('expectations', () => {
    it('rejects text exceeding 300 chars', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, expectations: 'a'.repeat(301) }),
      ).toThrow()
    })
    it('accepts text at exactly 300 chars', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, expectations: 'a'.repeat(300) }),
      ).not.toThrow()
    })
  })

  describe('inclusionMeasures', () => {
    it('rejects text exceeding 1000 chars', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, inclusionMeasures: 'a'.repeat(1001) }),
      ).toThrow()
    })
    it('accepts text at exactly 1000 chars', () => {
      expect(() =>
        stakeholderFormSchema.parse({ ...validBase, inclusionMeasures: 'a'.repeat(1000) }),
      ).not.toThrow()
    })
  })
})
