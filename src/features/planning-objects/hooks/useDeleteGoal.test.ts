import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useDeleteGoal } from './useDeleteGoal'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

beforeEach(() => {
  mockRequest.mockReset()
})

describe('useDeleteGoal', () => {
  it('calls DELETE_GOAL with id, version and cascade', async () => {
    mockRequest.mockResolvedValue({ deleteGoal: true })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, cascade: false })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      id: 'g-1',
      version: 1,
      cascade: false,
    })
  })

  it('invalidates goals query on success', async () => {
    mockRequest.mockResolvedValue({ deleteGoal: true })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, cascade: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })

  it('does not invalidate on error', async () => {
    mockRequest.mockRejectedValue(new Error('Conflict'))
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, cascade: false })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(false)
  })
})
