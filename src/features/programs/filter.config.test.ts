import { describe, expect, it } from 'vitest'

import { PROGRAM_DEFAULT_FILTER, toProgramGraphqlFilter } from './filter.config'

describe('PROGRAM_DEFAULT_FILTER', () => {
  it('initialises all fields to null', () => {
    expect(PROGRAM_DEFAULT_FILTER.name).toBeNull()
    expect(PROGRAM_DEFAULT_FILTER.status).toBeNull()
  })
})

describe('toProgramGraphqlFilter', () => {
  it('returns undefined when all fields are null', () => {
    expect(toProgramGraphqlFilter(PROGRAM_DEFAULT_FILTER)).toBeUndefined()
  })

  it('returns undefined when name is empty string', () => {
    expect(toProgramGraphqlFilter({ ...PROGRAM_DEFAULT_FILTER, name: '' })).toBeUndefined()
  })

  it('maps name field correctly', () => {
    const result = toProgramGraphqlFilter({ ...PROGRAM_DEFAULT_FILTER, name: 'Alpha' })
    expect(result).toEqual({ name: 'Alpha' })
  })

  it('maps status field correctly', () => {
    const result = toProgramGraphqlFilter({ ...PROGRAM_DEFAULT_FILTER, status: 'active' })
    expect(result).toEqual({ status: 'active' })
  })

  it('combines multiple active fields', () => {
    const result = toProgramGraphqlFilter({ name: 'Beta', status: 'draft' })
    expect(result).toEqual({ name: 'Beta', status: 'draft' })
  })
})
