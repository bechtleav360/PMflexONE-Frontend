import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFilterState } from './useFilterState'

const DEFAULT = { name: null as string | null, status: null as string | null }

describe('useFilterState — initial state', () => {
  it('returns the default filter', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    expect(result.current.filter).toEqual(DEFAULT)
  })

  it('isFiltered is false when filter matches default', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    expect(result.current.isFiltered).toBe(false)
  })
})

describe('useFilterState — setFilter', () => {
  it('merges a partial update without clearing other fields', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    act(() => result.current.setFilter({ name: 'foo' }))
    expect(result.current.filter).toEqual({ name: 'foo', status: null })
  })

  it('sets isFiltered to true after a partial update', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    act(() => result.current.setFilter({ name: 'foo' }))
    expect(result.current.isFiltered).toBe(true)
  })

  it('accumulates multiple partial updates', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    act(() => result.current.setFilter({ name: 'foo' }))
    act(() => result.current.setFilter({ status: 'active' }))
    expect(result.current.filter).toEqual({ name: 'foo', status: 'active' })
  })
})

describe('useFilterState — resetFilter', () => {
  it('restores the default filter', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    act(() => result.current.setFilter({ name: 'foo', status: 'active' }))
    act(() => result.current.resetFilter())
    expect(result.current.filter).toEqual(DEFAULT)
  })

  it('sets isFiltered back to false after reset', () => {
    const { result } = renderHook(() => useFilterState(DEFAULT))
    act(() => result.current.setFilter({ name: 'foo' }))
    act(() => result.current.resetFilter())
    expect(result.current.isFiltered).toBe(false)
  })
})
