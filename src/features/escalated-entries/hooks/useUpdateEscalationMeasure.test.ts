import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useUpdateEscalationMeasure } from './useUpdateEscalationMeasure'

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

describe('useUpdateEscalationMeasure', () => {
  beforeEach(() => mockRequest.mockReset())

  it('calls UPDATE_ESCALATION_MEASURE with correct input', async () => {
    mockRequest.mockResolvedValue({
      updateEscalationMeasure: {
        id: 'm-1',
        version: 2,
        content: 'Updated content',
        position: 1,
        updatedAt: '2024-01-16T00:00:00Z',
      },
    })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useUpdateEscalationMeasure('ee-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'm-1', version: 1, content: 'Updated content' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          id: 'm-1',
          version: 1,
          content: 'Updated content',
        }),
      }),
    )
  })

  it('invalidates parent escalatedEntry query on success', async () => {
    mockRequest.mockResolvedValue({
      updateEscalationMeasure: {
        id: 'm-1',
        version: 2,
        content: 'Updated content',
        position: 1,
        updatedAt: '2024-01-16T00:00:00Z',
      },
    })

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateEscalationMeasure('ee-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'm-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(
      calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntry' && k[1] === 'ee-1'),
    ).toBe(true)
  })
})
