import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useDeleteEscalationMeasure } from './useDeleteEscalationMeasure'

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

describe('useDeleteEscalationMeasure', () => {
  beforeEach(() => mockRequest.mockReset())

  it('calls DELETE_ESCALATION_MEASURE with the measure id', async () => {
    mockRequest.mockResolvedValue({ deleteEscalationMeasure: true })

    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useDeleteEscalationMeasure('ee-1'), { wrapper: Wrapper })

    result.current.mutate('m-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: 'm-1' }),
    )
  })

  it('invalidates parent escalatedEntry query on success', async () => {
    mockRequest.mockResolvedValue({ deleteEscalationMeasure: true })

    const { Wrapper, queryClient } = makeQueryWrapperWithClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteEscalationMeasure('ee-1'), { wrapper: Wrapper })

    result.current.mutate('m-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(
      calledKeys.some((k) => Array.isArray(k) && k[0] === 'escalatedEntry' && k[1] === 'ee-1'),
    ).toBe(true)
  })
})
