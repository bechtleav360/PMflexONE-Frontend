import { describe, expect, it } from 'vitest'

import { PROJECT_DEFAULT_FILTER, toProjectGraphqlFilter } from './filter.config'

describe('PROJECT_DEFAULT_FILTER', () => {
  it('initialises all fields to null', () => {
    expect(PROJECT_DEFAULT_FILTER.name).toBeNull()
    expect(PROJECT_DEFAULT_FILTER.governanceStatus).toBeNull()
    expect(PROJECT_DEFAULT_FILTER.sizeClassification).toBeNull()
  })
})

describe('toProjectGraphqlFilter', () => {
  it('returns undefined when all fields are null (default filter)', () => {
    expect(toProjectGraphqlFilter(PROJECT_DEFAULT_FILTER)).toBeUndefined()
  })

  it('returns undefined when name is an empty string', () => {
    expect(toProjectGraphqlFilter({ ...PROJECT_DEFAULT_FILTER, name: '' })).toBeUndefined()
  })

  it('maps name field correctly', () => {
    const result = toProjectGraphqlFilter({ ...PROJECT_DEFAULT_FILTER, name: 'Alpha' })
    expect(result).toEqual({ name: 'Alpha' })
  })

  it('maps governanceStatus field correctly', () => {
    const result = toProjectGraphqlFilter({ ...PROJECT_DEFAULT_FILTER, governanceStatus: 'formal' })
    expect(result).toEqual({ governanceStatus: 'formal' })
  })

  it('maps sizeClassification field correctly', () => {
    const result = toProjectGraphqlFilter({
      ...PROJECT_DEFAULT_FILTER,
      sizeClassification: 'large',
    })
    expect(result).toEqual({ sizeClassification: 'large' })
  })

  it('combines multiple active fields', () => {
    const result = toProjectGraphqlFilter({
      name: 'Beta',
      governanceStatus: 'unmanaged',
      sizeClassification: 'small',
    })
    expect(result).toEqual({
      name: 'Beta',
      governanceStatus: 'unmanaged',
      sizeClassification: 'small',
    })
  })
})
