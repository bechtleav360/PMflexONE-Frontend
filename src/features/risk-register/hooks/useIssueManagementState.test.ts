import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { IssueEntry } from '../types/issueEntry.types'
import {
  sortIssueManagementRows,
  useIssueManagementState,
  type IssueManagementSortState,
} from './useIssueManagementState'

const baseEntry: IssueEntry = {
  id: 'i-1',
  version: 1,
  entryNumber: 'I-001',
  name: 'Server down',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'OPEN',
  identificationDate: '2024-01-15',
  urgency: 3,
  impact: 4,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

const highUrgencyEntry: IssueEntry = {
  ...baseEntry,
  id: 'i-2',
  entryNumber: 'I-002',
  name: 'Critical failure',
  status: 'IN_PROGRESS',
  pestelCategory: 'ECONOMIC',
  urgency: 5,
  identificationDate: '2024-01-20',
}

const nullUrgencyEntry: IssueEntry = {
  ...baseEntry,
  id: 'i-3',
  entryNumber: 'I-003',
  name: 'Minor glitch',
  status: 'OPEN',
  urgency: null,
  identificationDate: '2024-01-10',
}

describe('sortIssueManagementRows', () => {
  it('sorts by urgency ascending, null last', () => {
    const sort: IssueManagementSortState = { field: 'urgency', direction: 'asc' }
    const rows = sortIssueManagementRows([highUrgencyEntry, baseEntry, nullUrgencyEntry], sort)
    expect(rows[0].id).toBe('i-1') // urgency 3
    expect(rows[1].id).toBe('i-2') // urgency 5
    expect(rows[2].id).toBe('i-3') // null — always last
  })

  it('sorts by urgency descending, null still last', () => {
    const sort: IssueManagementSortState = { field: 'urgency', direction: 'desc' }
    const rows = sortIssueManagementRows([baseEntry, highUrgencyEntry, nullUrgencyEntry], sort)
    expect(rows[0].id).toBe('i-2') // urgency 5
    expect(rows[1].id).toBe('i-1') // urgency 3
    expect(rows[2].id).toBe('i-3') // null — always last
  })

  it('sorts by identificationDate ascending', () => {
    const sort: IssueManagementSortState = { field: 'identificationDate', direction: 'asc' }
    const rows = sortIssueManagementRows([highUrgencyEntry, baseEntry, nullUrgencyEntry], sort)
    expect(rows[0].id).toBe('i-3') // 2024-01-10
    expect(rows[1].id).toBe('i-1') // 2024-01-15
    expect(rows[2].id).toBe('i-2') // 2024-01-20
  })

  it('sorts by identificationDate descending', () => {
    const sort: IssueManagementSortState = { field: 'identificationDate', direction: 'desc' }
    const rows = sortIssueManagementRows([nullUrgencyEntry, baseEntry, highUrgencyEntry], sort)
    expect(rows[0].id).toBe('i-2') // 2024-01-20
    expect(rows[1].id).toBe('i-1') // 2024-01-15
    expect(rows[2].id).toBe('i-3') // 2024-01-10
  })

  it('sorts by entryNumber ascending', () => {
    const sort: IssueManagementSortState = { field: 'entryNumber', direction: 'asc' }
    const rows = sortIssueManagementRows([highUrgencyEntry, nullUrgencyEntry, baseEntry], sort)
    expect(rows[0].id).toBe('i-1') // I-001
    expect(rows[1].id).toBe('i-2') // I-002
    expect(rows[2].id).toBe('i-3') // I-003
  })

  it('sorts by entryNumber descending', () => {
    const sort: IssueManagementSortState = { field: 'entryNumber', direction: 'desc' }
    const rows = sortIssueManagementRows([baseEntry, nullUrgencyEntry, highUrgencyEntry], sort)
    expect(rows[0].id).toBe('i-3') // I-003
    expect(rows[1].id).toBe('i-2') // I-002
    expect(rows[2].id).toBe('i-1') // I-001
  })

  it('handles two entries with null urgency (stable, both last)', () => {
    const anotherNull: IssueEntry = { ...nullUrgencyEntry, id: 'i-4', entryNumber: 'I-004' }
    const sort: IssueManagementSortState = { field: 'urgency', direction: 'asc' }
    const rows = sortIssueManagementRows([nullUrgencyEntry, anotherNull], sort)
    expect(rows.every((r) => r.urgency === null)).toBe(true)
  })
})

describe('useIssueManagementState', () => {
  it('returns all entries passed in (server has already filtered)', () => {
    const { result } = renderHook(() =>
      useIssueManagementState([baseEntry, highUrgencyEntry, nullUrgencyEntry]),
    )
    expect(result.current.rows).toHaveLength(3)
  })

  it('default sort is entryNumber asc', () => {
    const { result } = renderHook(() =>
      useIssueManagementState([highUrgencyEntry, nullUrgencyEntry, baseEntry]),
    )
    expect(result.current.sort.field).toBe('entryNumber')
    expect(result.current.sort.direction).toBe('asc')
    expect(result.current.rows[0].id).toBe('i-1') // I-001
    expect(result.current.rows[1].id).toBe('i-2') // I-002
    expect(result.current.rows[2].id).toBe('i-3') // I-003
  })

  it('setSort changes the sort direction', () => {
    const { result } = renderHook(() =>
      useIssueManagementState([baseEntry, highUrgencyEntry, nullUrgencyEntry]),
    )
    act(() => {
      result.current.setSort({ field: 'urgency', direction: 'desc' })
    })
    // null urgency still last even in desc
    expect(result.current.rows[result.current.rows.length - 1].id).toBe('i-3')
    expect(result.current.rows[0].id).toBe('i-2') // urgency 5 first in desc
  })

  it('filter state is initialised with default values', () => {
    const { result } = renderHook(() => useIssueManagementState([baseEntry]))
    expect(result.current.filter.status).toBeNull()
    expect(result.current.filter.pestelCategory).toBeNull()
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
  })

  it('setFilter updates filter state so the container can forward it to the query', () => {
    const { result } = renderHook(() => useIssueManagementState([baseEntry, highUrgencyEntry]))
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
    const { result } = renderHook(() => useIssueManagementState([baseEntry, highUrgencyEntry]))
    act(() => {
      result.current.setFilter({ ...result.current.filter, status: 'IN_PROGRESS' })
    })
    // Both entries are still in rows because the hook no longer client-filters
    expect(result.current.rows).toHaveLength(2)
  })

  it('includeTerminalStatuses is part of filter state for caller use', () => {
    const { result } = renderHook(() => useIssueManagementState([baseEntry]))
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
    act(() => {
      result.current.setFilter({ ...result.current.filter, includeTerminalStatuses: true })
    })
    expect(result.current.filter.includeTerminalStatuses).toBe(true)
  })
})
