import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PROGRAM_DEFAULT_FILTER } from '../filter.config'
import { useProgramFilterState } from './useProgramListState'

describe('useProgramFilterState — initial state', () => {
  it('returns the default filter', () => {
    const { result } = renderHook(() => useProgramFilterState())
    expect(result.current.filter).toEqual(PROGRAM_DEFAULT_FILTER)
  })

  it('isFiltered is false by default', () => {
    const { result } = renderHook(() => useProgramFilterState())
    expect(result.current.isFiltered).toBe(false)
  })

  it('graphqlFilter is undefined when filter is default', () => {
    const { result } = renderHook(() => useProgramFilterState())
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})

describe('useProgramFilterState — setFilter', () => {
  it('updates a single field', () => {
    const { result } = renderHook(() => useProgramFilterState())
    act(() => result.current.setFilter({ status: 'active' }))
    expect(result.current.filter.status).toBe('active')
    expect(result.current.isFiltered).toBe(true)
  })

  it('derives graphqlFilter when a field is set', () => {
    const { result } = renderHook(() => useProgramFilterState())
    act(() => result.current.setFilter({ name: 'Digital' }))
    expect(result.current.graphqlFilter).toEqual({ name: 'Digital' })
  })
})

describe('useProgramFilterState — resetFilter', () => {
  it('resets filter to default', () => {
    const { result } = renderHook(() => useProgramFilterState())
    act(() => result.current.setFilter({ name: 'Digital', status: 'active' }))
    act(() => result.current.resetFilter())
    expect(result.current.filter).toEqual(PROGRAM_DEFAULT_FILTER)
    expect(result.current.isFiltered).toBe(false)
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})
