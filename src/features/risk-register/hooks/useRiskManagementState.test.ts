import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { RiskEntry } from '../types/riskEntry.types'
import { useRiskManagementState } from './useRiskManagementState'

const baseRisk: RiskEntry = {
  id: 'r-1',
  version: 1,
  entryNumber: 'R-001',
  type: 'RISK',
  name: 'Budget overrun',
  pestelCategory: 'ECONOMIC',
  description: null,
  status: 'proposed',
  identificationDate: '2024-01-15',
  probability: 3,
  impact: 4,
  riskLevel: 12,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

const opportunity: RiskEntry = {
  ...baseRisk,
  id: 'r-2',
  entryNumber: 'R-002',
  name: 'Market expansion',
  type: 'OPPORTUNITY',
  status: 'assessed',
  pestelCategory: 'POLITICAL',
  riskLevel: 6,
}

const highRisk: RiskEntry = {
  ...baseRisk,
  id: 'r-3',
  entryNumber: 'R-003',
  name: 'Supply chain risk',
  type: 'RISK',
  status: 'proposed',
  pestelCategory: 'TECHNOLOGICAL',
  riskLevel: 20,
  identificationDate: '2024-01-20',
}

const nullRiskLevel: RiskEntry = {
  ...baseRisk,
  id: 'r-4',
  entryNumber: 'R-004',
  name: 'Unassessed risk',
  riskLevel: null,
  probability: null,
  impact: null,
  identificationDate: '2024-01-10',
}

describe('useRiskManagementState', () => {
  it('returns all entries passed in (server has already filtered)', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk, opportunity, highRisk]))
    expect(result.current.rows).toHaveLength(3)
  })

  it('default sort is entryNumber asc', () => {
    const { result } = renderHook(() => useRiskManagementState([highRisk, opportunity, baseRisk]))
    expect(result.current.sort.field).toBe('entryNumber')
    expect(result.current.sort.direction).toBe('asc')
    expect(result.current.rows[0].id).toBe('r-1') // R-001
    expect(result.current.rows[1].id).toBe('r-2') // R-002
    expect(result.current.rows[2].id).toBe('r-3') // R-003
  })

  it('sorts by riskLevel ascending when sort is changed', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk, highRisk, nullRiskLevel]))
    act(() => {
      result.current.setSort({ field: 'riskLevel', direction: 'asc' })
    })
    expect(result.current.rows[0].id).toBe('r-1') // riskLevel 12
    expect(result.current.rows[1].id).toBe('r-3') // riskLevel 20
    expect(result.current.rows[2].id).toBe('r-4') // null — always last
  })

  it('filter state is initialised with default values', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk]))
    expect(result.current.filter.type).toBeNull()
    expect(result.current.filter.status).toBeNull()
    expect(result.current.filter.pestelCategory).toBeNull()
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
  })

  it('setFilter updates filter state so the container can forward it to the query', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk, opportunity]))
    act(() => {
      result.current.setFilter({
        ...result.current.filter,
        type: 'RISK',
        status: 'proposed',
        includeTerminalStatuses: true,
      })
    })
    expect(result.current.filter.type).toBe('RISK')
    expect(result.current.filter.status).toBe('proposed')
    expect(result.current.filter.includeTerminalStatuses).toBe(true)
  })

  it('rows reflect all passed entries regardless of filter state (server handles filtering)', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk, opportunity]))
    act(() => {
      result.current.setFilter({ ...result.current.filter, type: 'RISK' })
    })
    // Both entries are still in rows because the hook no longer client-filters
    expect(result.current.rows).toHaveLength(2)
  })

  it('includeTerminalStatuses is accessible in filter state for server-side use', () => {
    const { result } = renderHook(() => useRiskManagementState([baseRisk]))
    expect(result.current.filter.includeTerminalStatuses).toBe(false)
    act(() => {
      result.current.setFilter({ ...result.current.filter, includeTerminalStatuses: true })
    })
    expect(result.current.filter.includeTerminalStatuses).toBe(true)
  })
})
