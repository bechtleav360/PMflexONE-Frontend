import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useCreateProgram } from './useCreateProgram'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleCreatedProgram = {
  id: 'prog-1',
  version: 1,
  name: 'New Program',
  status: null,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

describe('useCreateProgram', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls CREATE_PROGRAM mutation with the provided input', async () => {
    mockRequest.mockResolvedValue({ createProgram: sampleCreatedProgram })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProgram(), { wrapper: Wrapper })

    result.current.mutate({ name: 'New Program' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { input: { name: 'New Program' } })
  })

  it('returns the created program on success', async () => {
    mockRequest.mockResolvedValue({ createProgram: sampleCreatedProgram })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProgram(), { wrapper: Wrapper })

    result.current.mutate({ name: 'New Program' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('prog-1')
    expect(result.current.data?.name).toBe('New Program')
  })

  it('invalidates PROGRAMS_QUERY_KEY and PORTFOLIOS_QUERY_KEY on success', async () => {
    mockRequest.mockResolvedValue({ createProgram: sampleCreatedProgram })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateProgram(), { wrapper: Wrapper })

    result.current.mutate({ name: 'New Program' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys).toContainEqual(['programs'])
    expect(calledKeys).toContainEqual(['portfolios'])
  })

  it('exposes an error when the mutation fails', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProgram(), { wrapper: Wrapper })

    result.current.mutate({ name: 'New Program' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
