import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useCreateEscalatedEntry } from './useCreateEscalatedEntry'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleResponse = {
  createEscalatedEntry: {
    id: 'ee-1',
    version: 1,
    status: 'ACTIVE',
    escalatedAt: '2024-01-15T00:00:00Z',
    sourceEntryId: 'r-1',
    sourceEntryType: 'RISK',
    scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' },
    escalationChain: null,
    entryNumber: 'R-001',
    name: 'Budget risk',
  },
}

describe('useCreateEscalatedEntry', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls ESCALATE_ENTRY mutation with correct input', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCreateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      reason: 'Critical budget issue',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          sourceEntryId: 'r-1',
          sourceEntryType: 'RISK',
          reason: 'Critical budget issue',
        }),
      }),
    )
  })

  it('invalidates escalatedEntries and source entry queries on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      reason: 'Critical budget issue',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
  })

  it('calls toast.error on failure', async () => {
    const { toast } = await import('sonner')
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCreateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      reason: 'Critical budget issue',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })

  it('returns the created escalated entry on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCreateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({
      sourceEntryId: 'r-1',
      sourceEntryType: 'RISK',
      reason: 'Critical budget issue',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('ee-1')
    expect(result.current.data?.status).toBe('ACTIVE')
  })
})
