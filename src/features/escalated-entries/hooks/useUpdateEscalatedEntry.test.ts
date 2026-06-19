import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useUpdateEscalatedEntry } from './useUpdateEscalatedEntry'

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
  updateEscalatedEntry: {
    id: 'ee-1',
    version: 2,
    targetProbability: 2,
    targetImpact: 3,
    updatedAt: '2024-01-16T00:00:00Z',
  },
}

describe('useUpdateEscalatedEntry', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls UPDATE_ESCALATED_ENTRY mutation with correct input', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useUpdateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, targetProbability: 2, targetImpact: 3 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          id: 'ee-1',
          version: 1,
          targetProbability: 2,
          targetImpact: 3,
        }),
      }),
    )
  })

  it('invalidates escalatedEntry query on success', async () => {
    mockRequest.mockResolvedValue(sampleResponse)

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1, targetProbability: 2, targetImpact: 3 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(
      calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntry' && k[1] === 'ee-1'),
    ).toBe(true)
  })

  it('accepts optional targetProbability and targetImpact', async () => {
    mockRequest.mockResolvedValue({
      updateEscalatedEntry: {
        id: 'ee-1',
        version: 2,
        targetProbability: null,
        targetImpact: null,
        updatedAt: '2024-01-16T00:00:00Z',
      },
    })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useUpdateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('calls toast.error on failure', async () => {
    const { toast } = await import('sonner')
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useUpdateEscalatedEntry(), { wrapper: Wrapper })

    result.current.mutate({ id: 'ee-1', version: 1 })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })
})
