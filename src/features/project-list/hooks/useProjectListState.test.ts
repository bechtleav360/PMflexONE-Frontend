import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Project } from '@/entities/project'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useProjectListState } from './useProjectListState'

// SC-005: all filter/sort operations must resolve in < 1 s (client-side, ≤ 500 rows)

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: proj1,
  name: 'Alpha Project',
  status: 'active',
  version: 1,
  sizeClassification: 'medium',
  governanceStatus: 'formal',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const projects: Project[] = [
  makeProject({ id: 'p1', name: 'Alpha', sizeClassification: 'small', governanceStatus: 'formal' }),
  makeProject({
    id: 'p2',
    name: 'Beta',
    sizeClassification: 'medium',
    governanceStatus: 'unmanaged',
  }),
  makeProject({ id: 'p3', name: 'Gamma', sizeClassification: 'large', governanceStatus: 'formal' }),
]

describe('useProjectListState — search', () => {
  it('returns all rows when search is empty', () => {
    const { result } = renderHook(() => useProjectListState(projects))
    expect(result.current.rows).toHaveLength(3)
  })
})

describe('useProjectListState — sort', () => {
  it('sorts rows ascending by name', () => {
    const { result } = renderHook(() => useProjectListState(projects))
    act(() => result.current.setSort({ field: 'name', direction: 'asc' }))
    expect(result.current.rows.map((r) => r.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('sorts rows descending by name', () => {
    const { result } = renderHook(() => useProjectListState(projects))
    act(() => result.current.setSort({ field: 'name', direction: 'desc' }))
    expect(result.current.rows.map((r) => r.name)).toEqual(['Gamma', 'Beta', 'Alpha'])
  })

  it('sorts rows ascending by startDate', () => {
    const dated = [
      makeProject({ id: 'p1', name: 'A', startDate: '2026-03-01' }),
      makeProject({ id: 'p2', name: 'B', startDate: '2026-01-01' }),
      makeProject({ id: 'p3', name: 'C', startDate: '2026-02-01' }),
    ]
    const { result } = renderHook(() => useProjectListState(dated))
    act(() => result.current.setSort({ field: 'startDate', direction: 'asc' }))
    expect(result.current.rows.map((r) => r.startDate)).toEqual([
      '2026-01-01',
      '2026-02-01',
      '2026-03-01',
    ])
  })

  it('sort change resets page to 1', () => {
    const manyProjects = Array.from({ length: 30 }, (_, i) =>
      makeProject({ id: `p${i}`, name: `Project ${i}` }),
    )
    const { result } = renderHook(() => useProjectListState(manyProjects))
    act(() => result.current.setPage(2))
    act(() => result.current.setSort({ field: 'name', direction: 'asc' }))
    expect(result.current.page).toBe(1)
  })
})

describe('useProjectListState — pagination', () => {
  it('rows.length is ≤ 25', () => {
    const manyProjects = Array.from({ length: 30 }, (_, i) =>
      makeProject({ id: `p${i}`, name: `Project ${i}` }),
    )
    const { result } = renderHook(() => useProjectListState(manyProjects))
    expect(result.current.rows.length).toBeLessThanOrEqual(25)
  })

  it('last page has correct partial row count', () => {
    const manyProjects = Array.from({ length: 27 }, (_, i) =>
      makeProject({ id: `p${i}`, name: `Project ${i}` }),
    )
    const { result } = renderHook(() => useProjectListState(manyProjects))
    act(() => result.current.setPage(2))
    expect(result.current.rows).toHaveLength(2)
  })

  it('paginationProps is undefined when totalItems ≤ 25', () => {
    const { result } = renderHook(() => useProjectListState(projects))
    expect(result.current.paginationProps).toBeUndefined()
  })

  it('paginationProps is defined when totalItems > 25', () => {
    const manyProjects = Array.from({ length: 26 }, (_, i) =>
      makeProject({ id: `p${i}`, name: `Project ${i}` }),
    )
    const { result } = renderHook(() => useProjectListState(manyProjects))
    expect(result.current.paginationProps).toBeDefined()
    expect(result.current.paginationProps?.totalItems).toBe(26)
    expect(result.current.paginationProps?.pageSize).toBe(25)
  })
})
