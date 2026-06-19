import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { RequirementListItem } from '../types/requirement.types'
import { useRequirementManagementState } from './useRequirementManagementState'

function makeReq(
  overrides: Partial<RequirementListItem> & {
    id: string
    requirementScope: 'IN_SCOPE' | 'OUT_OF_SCOPE'
  },
): RequirementListItem {
  return {
    version: 1,
    sortOrder: 0,
    name: overrides.id,
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'NEW',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    parent: null,
    ...overrides,
  }
}

const requirements: RequirementListItem[] = [
  makeReq({ id: 'r-1', requirementScope: 'IN_SCOPE' }),
  makeReq({ id: 'r-2', requirementScope: 'IN_SCOPE' }),
  makeReq({ id: 'r-3', requirementScope: 'OUT_OF_SCOPE' }),
]

describe('useRequirementManagementState', () => {
  it('starts with ALL filter', () => {
    const { result } = renderHook(() => useRequirementManagementState(requirements))
    expect(result.current.filter).toBe('ALL')
  })

  it('returns all requirements when filter is ALL', () => {
    const { result } = renderHook(() => useRequirementManagementState(requirements))
    const ids = result.current.tree.flatMap((n) => [n.id, ...n.childNodes.map((c) => c.id)])
    expect(ids).toContain('r-1')
    expect(ids).toContain('r-2')
    expect(ids).toContain('r-3')
  })

  it('filters to IN_SCOPE only', () => {
    const { result } = renderHook(() => useRequirementManagementState(requirements))

    act(() => {
      result.current.setFilter('IN_SCOPE')
    })

    const ids = result.current.tree.flatMap((n) => [n.id, ...n.childNodes.map((c) => c.id)])
    expect(ids).toContain('r-1')
    expect(ids).toContain('r-2')
    expect(ids).not.toContain('r-3')
  })

  it('filters to OUT_OF_SCOPE only', () => {
    const { result } = renderHook(() => useRequirementManagementState(requirements))

    act(() => {
      result.current.setFilter('OUT_OF_SCOPE')
    })

    const ids = result.current.tree.flatMap((n) => [n.id, ...n.childNodes.map((c) => c.id)])
    expect(ids).toContain('r-3')
    expect(ids).not.toContain('r-1')
    expect(ids).not.toContain('r-2')
  })

  it('counts are always based on full list regardless of active filter', () => {
    const { result } = renderHook(() => useRequirementManagementState(requirements))

    act(() => {
      result.current.setFilter('IN_SCOPE')
    })

    expect(result.current.totalCount).toBe(3)
    expect(result.current.inScopeCount).toBe(2)
    expect(result.current.outOfScopeCount).toBe(1)
  })

  it('counts reflect empty list', () => {
    const { result } = renderHook(() => useRequirementManagementState([]))
    expect(result.current.totalCount).toBe(0)
    expect(result.current.inScopeCount).toBe(0)
    expect(result.current.outOfScopeCount).toBe(0)
  })
})
