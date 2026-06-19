import { describe, expect, it } from 'vitest'

import { createProgramSchema, editProgramSchema } from './programSchema'

describe('createProgramSchema', () => {
  it('parses valid input with null metadata', () => {
    const result = createProgramSchema.parse({ name: 'My Program', metadata: null })
    expect(result.name).toBe('My Program')
    expect(result.metadata).toBeNull()
  })

  it('parses valid input with valid JSON metadata', () => {
    const result = createProgramSchema.parse({
      name: 'My Program',
      metadata: '{"key":"value"}',
    })
    expect(result.name).toBe('My Program')
    expect(result.metadata).toBe('{"key":"value"}')
  })

  it('rejects input with invalid JSON metadata', () => {
    const result = createProgramSchema.safeParse({
      name: 'My Program',
      metadata: 'not valid json',
    })
    expect(result.success).toBe(false)
  })

  it('rejects blank name', () => {
    const result = createProgramSchema.safeParse({ name: '', metadata: null })
    expect(result.success).toBe(false)
  })

  it('normalises empty string metadata to null', () => {
    const result = createProgramSchema.parse({ name: 'My Program', metadata: '' })
    expect(result.metadata).toBeNull()
  })

  it('accepts optional portfolioId', () => {
    const result = createProgramSchema.parse({
      name: 'My Program',
      portfolioId: 'port-1',
      metadata: null,
    })
    expect(result.portfolioId).toBe('port-1')
  })
})

describe('editProgramSchema', () => {
  it('parses valid edit input', () => {
    const result = editProgramSchema.parse({ name: 'Updated', status: 'active', metadata: null })
    expect(result.name).toBe('Updated')
    expect(result.status).toBe('active')
    expect(result.metadata).toBeNull()
  })

  it('rejects invalid JSON metadata in edit schema', () => {
    const result = editProgramSchema.safeParse({
      name: 'Updated',
      status: 'active',
      metadata: '{bad json}',
    })
    expect(result.success).toBe(false)
  })
})
