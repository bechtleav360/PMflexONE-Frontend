import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ProblemEntry } from '../types/problemEntry.types'
import {
  sortProblemManagementRows,
  useProblemManagementState,
  type ProblemManagementSortState,
} from './useProblemManagementState'

const baseEntry: ProblemEntry = {
  id: 'p-1',
  version: 1,
  entryNumber: 'P-001',
  name: 'Server crash',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'OPEN',
  identificationDate: '2024-01-15',
  impact: 3,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

const secondEntry: ProblemEntry = {
  ...baseEntry,
  id: 'p-2',
  entryNumber: 'P-002',
  name: 'Budget leak',
  status: 'IN_PROGRESS',
  pestelCategory: 'ECONOMIC',
  identificationDate: '2024-01-20',
}

const thirdEntry: ProblemEntry = {
  ...baseEntry,
  id: 'p-3',
  entryNumber: 'P-003',
  name: 'Minor regression',
  status: 'OPEN',
  identificationDate: '2024-01-10',
}

describe('sortProblemManagementRows', () => {
  it('sorts by identificationDate ascending', () => {
    const sort: ProblemManagementSortState = { field: 'identificationDate', direction: 'asc' }
    const rows = sortProblemManagementRows([secondEntry, baseEntry, thirdEntry], sort)
    expect(rows[0].id).toBe('p-3') // 2024-01-10
    expect(rows[1].id).toBe('p-1') // 2024-01-15
    expect(rows[2].id).toBe('p-2') // 2024-01-20
  })

  it('sorts by identificationDate descending', () => {
    const sort: ProblemManagementSortState = { field: 'identificationDate', direction: 'desc' }
    const rows = sortProblemManagementRows([thirdEntry, baseEntry, secondEntry], sort)
    expect(rows[0].id).toBe('p-2') // 2024-01-20
    expect(rows[1].id).toBe('p-1') // 2024-01-15
    expect(rows[2].id).toBe('p-3') // 2024-01-10
  })

  it('sorts by entryNumber ascending', () => {
    const sort: ProblemManagementSortState = { field: 'entryNumber', direction: 'asc' }
    const rows = sortProblemManagementRows([thirdEntry, secondEntry, baseEntry], sort)
    expect(rows[0].id).toBe('p-1') // P-001
    expect(rows[1].id).toBe('p-2') // P-002
    expect(rows[2].id).toBe('p-3') // P-003
  })

  it('sorts by entryNumber descending', () => {
    const sort: ProblemManagementSortState = { field: 'entryNumber', direction: 'desc' }
    const rows = sortProblemManagementRows([baseEntry, secondEntry, thirdEntry], sort)
    expect(rows[0].id).toBe('p-3') // P-003
    expect(rows[1].id).toBe('p-2') // P-002
    expect(rows[2].id).toBe('p-1') // P-001
  })

  it('does not mutate the original array', () => {
    const original = [secondEntry, baseEntry]
    const sort: ProblemManagementSortState = { field: 'entryNumber', direction: 'asc' }
    const sorted = sortProblemManagementRows(original, sort)
    expect(sorted[0].id).toBe('p-1')
    expect(original[0].id).toBe('p-2')
  })
})

describe('useProblemManagementState', () => {
  it('returns all entries passed in (server has already filtered)', () => {
    const { result } = renderHook(() =>
      useProblemManagementState([baseEntry, secondEntry, thirdEntry]),
    )
    expect(result.current.rows).toHaveLength(3)
  })

  it('default sort is entryNumber asc', () => {
    const { result } = renderHook(() =>
      useProblemManagementState([thirdEntry, secondEntry, baseEntry]),
    )
    expect(result.current.sort.field).toBe('entryNumber')
    expect(result.current.sort.direction).toBe('asc')
    expect(result.current.rows[0].id).toBe('p-1') // P-001
    expect(result.current.rows[1].id).toBe('p-2') // P-002
    expect(result.current.rows[2].id).toBe('p-3') // P-003
  })

  it('setSort changes the active sort', () => {
    const { result } = renderHook(() =>
      useProblemManagementState([baseEntry, secondEntry, thirdEntry]),
    )
    act(() => {
      result.current.setSort({ field: 'identificationDate', direction: 'desc' })
    })
    expect(result.current.rows[0].id).toBe('p-2') // 2024-01-20 first in desc
  })

  it('filter state is initialised with default values', () => {
    const { result } = renderHook(() => useProblemManagementState([baseEntry]))
    expect(result.current.filter.status).toBeNull()
    expect(result.current.filter.pestelCategory).toBeNull()
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
  })

  it('setFilter updates filter state so the container can forward it to the query', () => {
    const { result } = renderHook(() => useProblemManagementState([baseEntry, secondEntry]))
    act(() => {
      result.current.setFilter({
        ...result.current.filter,
        status: 'IN_PROGRESS',
        pestelCategory: 'ECONOMIC',
      })
    })
    expect(result.current.filter.status).toBe('IN_PROGRESS')
    expect(result.current.filter.pestelCategory).toBe('ECONOMIC')
  })

  it('rows reflect all passed entries regardless of filter state (server handles filtering)', () => {
    const { result } = renderHook(() => useProblemManagementState([baseEntry, secondEntry]))
    act(() => {
      result.current.setFilter({ ...result.current.filter, status: 'IN_PROGRESS' })
    })
    // Both entries are still in rows because the hook no longer client-filters
    expect(result.current.rows).toHaveLength(2)
  })

  it('includeTerminalStatuses is accessible in filter state for server-side use', () => {
    const { result } = renderHook(() => useProblemManagementState([baseEntry]))
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
    act(() => {
      result.current.setFilter({ ...result.current.filter, includeTerminalStatuses: true })
    })
    expect(result.current.filter.includeTerminalStatuses).toBe(true)
  })
})
