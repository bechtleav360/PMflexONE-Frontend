import { describe, expect, it } from 'vitest'

import { workItemFormSchema } from './workItemFormSchema'

describe('workItemFormSchema', () => {
  it('accepts a minimal valid payload (name only)', () => {
    expect(() => workItemFormSchema.parse({ name: 'My task' })).not.toThrow()
  })

  it('rejects an empty name', () => {
    expect(() => workItemFormSchema.parse({ name: '' })).toThrow()
  })

  it('rejects a missing name', () => {
    expect(() => workItemFormSchema.parse({})).toThrow()
  })

  it('rejects a name longer than 255 characters', () => {
    expect(() => workItemFormSchema.parse({ name: 'a'.repeat(256) })).toThrow()
  })

  it('accepts name at exactly 255 characters', () => {
    expect(() => workItemFormSchema.parse({ name: 'a'.repeat(255) })).not.toThrow()
  })

  it('accepts null description', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', description: null })).not.toThrow()
  })

  it('accepts undefined description', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task' })).not.toThrow()
  })

  it('rejects description longer than 2000 characters', () => {
    expect(() =>
      workItemFormSchema.parse({ name: 'Task', description: 'a'.repeat(2001) }),
    ).toThrow()
  })

  it('accepts description at exactly 2000 characters', () => {
    expect(() =>
      workItemFormSchema.parse({ name: 'Task', description: 'a'.repeat(2000) }),
    ).not.toThrow()
  })

  it('accepts a valid ISO date string for dueDate', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', dueDate: '2026-12-31' })).not.toThrow()
  })

  it('rejects a non-ISO dueDate string', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', dueDate: '31.12.2026' })).toThrow()
  })

  it('accepts null dueDate', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', dueDate: null })).not.toThrow()
  })

  it('accepts valid priority values', () => {
    for (const priority of ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']) {
      expect(() => workItemFormSchema.parse({ name: 'Task', priority })).not.toThrow()
    }
  })

  it('rejects an invalid priority value', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', priority: 'critical' })).toThrow()
  })

  it('accepts a valid assigneeId string', () => {
    expect(() => workItemFormSchema.parse({ name: 'Task', assigneeId: 'user-1' })).not.toThrow()
  })
})
