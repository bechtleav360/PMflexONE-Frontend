import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useEscalatedEntry } from './useEscalatedEntry'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleDetailResponse = {
  escalatedEntry: {
    id: 'ee-1',
    version: 1,
    sourceEntryType: 'RISK',
    sourceEntryId: 'r-1',
    scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' },
    escalationChain: null,
    status: 'ACTIVE',
    entryNumber: 'R-001',
    name: 'Budget Risk',
    description: null,
    pestelCategory: null,
    sourceStatus: null,
    probability: 3,
    impact: 4,
    riskLevel: 12,
    targetProbability: null,
    targetImpact: null,
    escalatedAt: '2024-01-15T00:00:00Z',
    returnedAt: null,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
    updater: null,
    escalationProtocol: [
      {
        id: 'ep-1',
        version: 1,
        eventType: 'ESCALATION',
        reason: 'Critical budget risk',
        occurredAt: '2024-01-15T00:00:00Z',
        performedBy: {
          id: 'u-1',
          firstName: 'Alice',
          lastName: 'Smith',
          mail: 'alice@example.com',
        },
      },
    ],
    measures: [
      {
        id: 'm-1',
        version: 1,
        content: 'Reduce scope',
        position: 1,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
      },
    ],
  },
}

describe('useEscalatedEntry', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls GET_ESCALATED_ENTRY with the entry id', async () => {
    mockRequest.mockResolvedValue(sampleDetailResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useEscalatedEntry('ee-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: 'ee-1' }),
    )
  })

  it('returns entry with escalationProtocol array', async () => {
    mockRequest.mockResolvedValue(sampleDetailResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useEscalatedEntry('ee-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.escalationProtocol).toHaveLength(1)
    expect(result.current.data?.escalationProtocol[0].eventType).toBe('ESCALATION')
    expect(result.current.data?.escalationProtocol[0].reason).toBe('Critical budget risk')
  })

  it('returns entry with measures array ordered by position', async () => {
    mockRequest.mockResolvedValue(sampleDetailResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useEscalatedEntry('ee-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.measures).toHaveLength(1)
    expect(result.current.data?.measures[0].content).toBe('Reduce scope')
    expect(result.current.data?.measures[0].position).toBe(1)
  })

  it('uses query key ["escalatedEntry", id]', async () => {
    mockRequest.mockResolvedValue(sampleDetailResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    renderHook(() => useEscalatedEntry('ee-1'), { wrapper: Wrapper })

    await waitFor(() => {
      const cache = queryClient.getQueryCache().findAll()
      return cache.some((q) => {
        const key = q.queryKey as unknown[]
        return key[0] === 'escalatedEntry' && key[1] === 'ee-1'
      })
    })
  })

  it('returns null data when escalatedEntry is null', async () => {
    mockRequest.mockResolvedValue({ escalatedEntry: null })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useEscalatedEntry('ee-missing'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})
