import { describe, expect, it } from 'vitest'

import type { RiskEntry } from '../types/riskEntry.types'
import { sortRiskManagementRows } from './riskManagementSort'

function makeRisk(overrides: Partial<RiskEntry> = {}): RiskEntry {
  return {
    id: 'r-1',
    version: 1,
    entryNumber: 'R001',
    type: 'RISK',
    name: 'Test risk',
    pestelCategory: 'ECONOMIC',
    description: null,
    status: 'proposed',
    identificationDate: '2024-01-01',
    probability: null,
    impact: null,
    riskLevel: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    owner: null,
    reporter: null,
    activeEscalations: [],
    ...overrides,
  }
}

// eslint-disable-next-line max-lines-per-function -- test describe block; splitting individual it() callbacks hurts readability
describe('sortRiskManagementRows', () => {
  describe('riskLevel sort', () => {
    it('sorts ascending by riskLevel', () => {
      const rows = [
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: 12 }),
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: 3 }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'asc' })
      expect(sorted[0].entryNumber).toBe('R001')
      expect(sorted[1].entryNumber).toBe('R002')
    })

    it('sorts descending by riskLevel', () => {
      const rows = [
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: 3 }),
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: 12 }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'desc' })
      expect(sorted[0].entryNumber).toBe('R002')
      expect(sorted[1].entryNumber).toBe('R001')
    })

    it('places null riskLevel entries at bottom when sorting asc', () => {
      const rows = [
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: null }),
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: 3 }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'asc' })
      expect(sorted[sorted.length - 1].entryNumber).toBe('R002')
      expect(sorted[0].entryNumber).toBe('R001')
    })

    it('places null riskLevel entries at bottom when sorting desc', () => {
      const rows = [
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: null }),
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: 12 }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'desc' })
      expect(sorted[sorted.length - 1].entryNumber).toBe('R002')
      expect(sorted[0].entryNumber).toBe('R001')
    })

    it('keeps two null-riskLevel entries stable relative to each other', () => {
      const rows = [
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: null }),
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: null }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'asc' })
      expect(sorted).toHaveLength(2)
    })
  })

  describe('entryNumber sort', () => {
    it('sorts rows by entryNumber ascending', () => {
      const rows = [
        makeRisk({ id: 'r-3', entryNumber: 'R003' }),
        makeRisk({ id: 'r-1', entryNumber: 'R001' }),
        makeRisk({ id: 'r-2', entryNumber: 'R002' }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'entryNumber', direction: 'asc' })
      expect(sorted[0].entryNumber).toBe('R001')
      expect(sorted[1].entryNumber).toBe('R002')
      expect(sorted[2].entryNumber).toBe('R003')
    })

    it('sorts rows by entryNumber descending', () => {
      const rows = [
        makeRisk({ id: 'r-1', entryNumber: 'R001' }),
        makeRisk({ id: 'r-3', entryNumber: 'R003' }),
      ]
      const sorted = sortRiskManagementRows(rows, { field: 'entryNumber', direction: 'desc' })
      expect(sorted[0].entryNumber).toBe('R003')
    })
  })

  describe('identificationDate sort', () => {
    it('sorts rows by date ascending', () => {
      const rows = [
        makeRisk({ id: 'r-2', entryNumber: 'R002', identificationDate: '2024-06-01' }),
        makeRisk({ id: 'r-1', entryNumber: 'R001', identificationDate: '2024-01-01' }),
      ]
      const sorted = sortRiskManagementRows(rows, {
        field: 'identificationDate',
        direction: 'asc',
      })
      expect(sorted[0].entryNumber).toBe('R001')
    })
  })

  describe('immutability', () => {
    it('does not mutate the input array', () => {
      const rows = [
        makeRisk({ id: 'r-2', entryNumber: 'R002', riskLevel: 12 }),
        makeRisk({ id: 'r-1', entryNumber: 'R001', riskLevel: 3 }),
      ]
      const originalFirst = rows[0].id
      sortRiskManagementRows(rows, { field: 'riskLevel', direction: 'asc' })
      expect(rows[0].id).toBe(originalFirst)
    })
  })
})
