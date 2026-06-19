import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PROJECT_DEFAULT_FILTER } from '../filter.config'
import { useProjectFilterState } from './useProjectListState'

describe('useProjectFilterState — initial state', () => {
  it('returns the default filter', () => {
    const { result } = renderHook(() => useProjectFilterState())
    expect(result.current.filter).toEqual(PROJECT_DEFAULT_FILTER)
  })

  it('isFiltered is false by default', () => {
    const { result } = renderHook(() => useProjectFilterState())
    expect(result.current.isFiltered).toBe(false)
  })

  it('graphqlFilter is undefined when filter is default', () => {
    const { result } = renderHook(() => useProjectFilterState())
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})

describe('useProjectFilterState — setFilter', () => {
  it('updates a single field', () => {
    const { result } = renderHook(() => useProjectFilterState())
    act(() => result.current.setFilter({ name: 'Alpha' }))
    expect(result.current.filter.name).toBe('Alpha')
    expect(result.current.isFiltered).toBe(true)
  })

  it('exposes a non-null graphqlFilter when a field is set', () => {
    const { result } = renderHook(() => useProjectFilterState())
    act(() => result.current.setFilter({ governanceStatus: 'formal' }))
    expect(result.current.graphqlFilter).toEqual({ governanceStatus: 'formal' })
  })
})

describe('useProjectFilterState — resetFilter', () => {
  it('resets filter to default and clears graphqlFilter', () => {
    const { result } = renderHook(() => useProjectFilterState())
    act(() => result.current.setFilter({ name: 'Alpha' }))
    act(() => result.current.resetFilter())
    expect(result.current.filter).toEqual(PROJECT_DEFAULT_FILTER)
    expect(result.current.isFiltered).toBe(false)
    expect(result.current.graphqlFilter).toBeUndefined()
  })
})
