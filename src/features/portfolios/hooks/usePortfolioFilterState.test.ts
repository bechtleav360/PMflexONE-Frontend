import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PORTFOLIO_DEFAULT_FILTER } from '../filter.config'
import { usePortfolioFilterState } from './usePortfolioListState'

describe('usePortfolioFilterState — initial state', () => {
  it('returns the default filter', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    expect(result.current.filter).toEqual(PORTFOLIO_DEFAULT_FILTER)
  })

  it('isFiltered is false by default', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    expect(result.current.isFiltered).toBe(false)
  })

  it('graphqlFilter is undefined when filter is default', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})

describe('usePortfolioFilterState — setFilter', () => {
  it('updates name field', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    act(() => result.current.setFilter({ name: 'Digital' }))
    expect(result.current.filter.name).toBe('Digital')
    expect(result.current.isFiltered).toBe(true)
  })

  it('updates year fields and derives graphqlFilter', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    act(() => result.current.setFilter({ startYear: 2026 }))
    expect(result.current.graphqlFilter).toEqual({ startYear: 2026 })
  })
})

describe('usePortfolioFilterState — resetFilter', () => {
  it('resets filter to default', () => {
    const { result } = renderHook(() => usePortfolioFilterState())
    act(() => result.current.setFilter({ name: 'Digital', endYear: 2030 }))
    act(() => result.current.resetFilter())
    expect(result.current.filter).toEqual(PORTFOLIO_DEFAULT_FILTER)
    expect(result.current.isFiltered).toBe(false)
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})
