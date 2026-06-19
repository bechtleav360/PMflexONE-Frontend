import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useDeEscalateEntry } from './useDeEscalateEntry'

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
  deEscalateEntry: {
    id: 'ee-1',
    version: 2,
    status: 'RETURNED',
    returnedAt: '2024-02-01T00:00:00Z',
  },
}

describe('useDeEscalateEntry', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls DE_ESCALATE_ENTRY mutation with id, version, and reason', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          id: 'ee-1',
          version: 1,
          reason: 'No longer critical',
        }),
      }),
    )
  })

  it('invalidates the individual escalatedEntry query on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(
      calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntry' && k[1] === 'ee-1'),
    ).toBe(true)
  })

  it('invalidates escalatedEntries list query on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntries')).toBe(true)
  })

  it('shows toast.success on success', async () => {
    const { toast } = await import('sonner')
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalled()
  })

  it('calls toast.error on failure', async () => {
    const { toast } = await import('sonner')
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })

  it('returns the updated escalated entry status on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useDeEscalateEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, reason: 'No longer critical' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('RETURNED')
    expect(result.current.data?.returnedAt).toBe('2024-02-01T00:00:00Z')
  })
})
