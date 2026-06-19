import { describe, expect, it } from 'vitest'

import { PORTFOLIO_DEFAULT_FILTER, toPortfolioGraphqlFilter } from './filter.config'

describe('PORTFOLIO_DEFAULT_FILTER', () => {
  it('initialises all fields to null', () => {
    expect(PORTFOLIO_DEFAULT_FILTER.name).toBeNull()
    expect(PORTFOLIO_DEFAULT_FILTER.startYear).toBeNull()
    expect(PORTFOLIO_DEFAULT_FILTER.endYear).toBeNull()
  })
})

describe('toPortfolioGraphqlFilter', () => {
  it('returns undefined when all fields are null', () => {
    expect(toPortfolioGraphqlFilter(PORTFOLIO_DEFAULT_FILTER)).toBeUndefined()
  })

  it('returns undefined when name is empty string', () => {
    expect(toPortfolioGraphqlFilter({ ...PORTFOLIO_DEFAULT_FILTER, name: '' })).toBeUndefined()
  })

  it('maps name field correctly', () => {
    const result = toPortfolioGraphqlFilter({ ...PORTFOLIO_DEFAULT_FILTER, name: 'Digital' })
    expect(result).toEqual({ name: 'Digital' })
  })

  it('maps startYear field correctly', () => {
    const result = toPortfolioGraphqlFilter({ ...PORTFOLIO_DEFAULT_FILTER, startYear: 2026 })
    expect(result).toEqual({ startYear: 2026 })
  })

  it('maps endYear field correctly', () => {
    const result = toPortfolioGraphqlFilter({ ...PORTFOLIO_DEFAULT_FILTER, endYear: 2030 })
    expect(result).toEqual({ endYear: 2030 })
  })

  it('combines multiple active fields', () => {
    const result = toPortfolioGraphqlFilter({ name: 'Digital', startYear: 2026, endYear: 2030 })
    expect(result).toEqual({ name: 'Digital', startYear: 2026, endYear: 2030 })
  })
})
