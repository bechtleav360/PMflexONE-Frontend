import { act } from 'react'

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Portfolio } from '../types/portfolio.types'
import { usePortfolioListState } from './usePortfolioListState'

const portfolios: Portfolio[] = [
  {
    id: 'p1',
    version: 1,
    name: 'Zebra Initiative',
    startYear: 2028,
    endYear: 2030,
    createdAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'p2',
    version: 1,
    name: 'Alpha Programme',
    startYear: 2026,
    endYear: null,
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'p3',
    version: 1,
    name: 'Mitte Projekt',
    startYear: null,
    endYear: 2027,
    createdAt: '2026-01-01T00:00:00Z',
  },
]

describe('usePortfolioListState — initial state', () => {
  it('returns rows in original order when sort is null', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    expect(result.current.sort).toBeNull()
    expect(result.current.rows.map((r) => r.id)).toEqual(['p1', 'p2', 'p3'])
  })

  it('reports totalItems equal to row count', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    expect(result.current.totalItems).toBe(3)
  })
})

describe('usePortfolioListState — sorting by name', () => {
  it('sorts by name ascending', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'name', direction: 'asc' }))
    expect(result.current.rows.map((r) => r.id)).toEqual(['p2', 'p3', 'p1'])
  })

  it('sorts by name descending', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'name', direction: 'desc' }))
    expect(result.current.rows.map((r) => r.id)).toEqual(['p1', 'p3', 'p2'])
  })
})

describe('usePortfolioListState — sorting by year (nulls last)', () => {
  it('sorts by startYear ascending with null last', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'startYear', direction: 'asc' }))
    const ids = result.current.rows.map((r) => r.id)
    expect(ids[0]).toBe('p2') // 2026
    expect(ids[1]).toBe('p1') // 2028
    expect(ids[2]).toBe('p3') // null → last
  })

  it('sorts by startYear descending with null last', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'startYear', direction: 'desc' }))
    const ids = result.current.rows.map((r) => r.id)
    expect(ids[0]).toBe('p1') // 2028
    expect(ids[1]).toBe('p2') // 2026
    expect(ids[2]).toBe('p3') // null → last
  })

  it('sorts by endYear ascending with null last', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'endYear', direction: 'asc' }))
    const ids = result.current.rows.map((r) => r.id)
    expect(ids[0]).toBe('p3') // 2027
    expect(ids[1]).toBe('p1') // 2030
    expect(ids[2]).toBe('p2') // null → last
  })
})

describe('usePortfolioListState — resetting sort', () => {
  it('restores original order when sort is set back to null', () => {
    const { result } = renderHook(() => usePortfolioListState(portfolios))
    act(() => result.current.setSort({ field: 'name', direction: 'asc' }))
    act(() => result.current.setSort(null))
    expect(result.current.rows.map((r) => r.id)).toEqual(['p1', 'p2', 'p3'])
  })
})
