import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useDeleteConstraint } from './useDeleteConstraint'

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

describe('useDeleteConstraint', () => {
  it('calls graphqlClient with id and version', async () => {
    mockRequest.mockResolvedValue({})
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'c-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { id: 'c-1', version: 1 })
  })

  it('invalidates constraints query on success', async () => {
    mockRequest.mockResolvedValue({})
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'c-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'constraints')).toBe(true)
  })
})
