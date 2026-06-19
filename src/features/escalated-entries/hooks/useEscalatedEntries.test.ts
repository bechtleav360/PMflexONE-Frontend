import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useEscalatedEntries } from './useEscalatedEntries'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleEntry = {
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
}

const sampleListResponse = { escalatedEntries: [sampleEntry] }

describe('useEscalatedEntries', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls GET_ESCALATED_ENTRIES with correct filter variables', async () => {
    mockRequest.mockResolvedValue(sampleListResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(
      () =>
        useEscalatedEntries({ scopeId: 'prog-1', scopeType: 'Program', sourceEntryType: 'RISK' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        filter: expect.objectContaining({
          scopeId: 'prog-1',
          scopeType: 'Program',
          sourceEntryType: 'RISK',
        }),
      }),
    )
  })

  it('returns validated list of escalated entries', async () => {
    mockRequest.mockResolvedValue(sampleListResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(
      () => useEscalatedEntries({ scopeId: 'prog-1', scopeType: 'Program' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe('ee-1')
    expect(result.current.data?.[0].status).toBe('ACTIVE')
  })

  it('uses query key including scopeId, scopeType, and optional sourceEntryType', async () => {
    mockRequest.mockResolvedValue(sampleListResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    renderHook(
      () =>
        useEscalatedEntries({ scopeId: 'prog-1', scopeType: 'Program', sourceEntryType: 'RISK' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      const cache = queryClient.getQueryCache().findAll()
      return cache.some((q) => {
        const key = q.queryKey as unknown[]
        return (
          key[0] === 'escalatedEntries' &&
          key[1] === 'prog-1' &&
          key[2] === 'Program' &&
          key[3] === 'RISK'
        )
      })
    })
  })

  it('works without optional sourceEntryType (key includes undefined)', async () => {
    mockRequest.mockResolvedValue(sampleListResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    renderHook(() => useEscalatedEntries({ scopeId: 'prog-1', scopeType: 'Program' }), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      const cache = queryClient.getQueryCache().findAll()
      return cache.some((q) => {
        const key = q.queryKey as unknown[]
        return key[0] === 'escalatedEntries' && key[1] === 'prog-1' && key[2] === 'Program'
      })
    })
  })

  it('errors when response fails Zod validation', async () => {
    mockRequest.mockResolvedValue({ escalatedEntries: [{ id: 123 }] })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(
      () => useEscalatedEntries({ scopeId: 'prog-1', scopeType: 'Program' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
