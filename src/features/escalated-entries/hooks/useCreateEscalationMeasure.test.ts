import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useCreateEscalationMeasure } from './useCreateEscalationMeasure'

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

describe('useCreateEscalationMeasure', () => {
  beforeEach(() => mockRequest.mockReset())

  it('calls CREATE_ESCALATION_MEASURE with correct input', async () => {
    mockRequest.mockResolvedValue({
      createEscalationMeasure: {
        id: 'm-1',
        version: 1,
        content: 'Reduce scope',
        position: 1,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
      },
    })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCreateEscalationMeasure(), { wrapper: Wrapper })

    result.current.mutate({ escalatedEntryId: 'ee-1', content: 'Reduce scope' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          escalatedEntryId: 'ee-1',
          content: 'Reduce scope',
        }),
      }),
    )
  })

  it('invalidates parent escalatedEntry query on success', async () => {
    mockRequest.mockResolvedValue({
      createEscalationMeasure: {
        id: 'm-1',
        version: 1,
        content: 'Reduce scope',
        position: 1,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        creator: null,
      },
    })

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateEscalationMeasure(), { wrapper: Wrapper })

    result.current.mutate({ escalatedEntryId: 'ee-1', content: 'Reduce scope' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(
      calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntry' && k[1] === 'ee-1'),
    ).toBe(true)
  })
})
