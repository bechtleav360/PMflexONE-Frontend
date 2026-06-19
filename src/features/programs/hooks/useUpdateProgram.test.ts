import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useUpdateProgram } from './useUpdateProgram'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleUpdatedProgram = {
  id: 'prog-1',
  version: 2,
  name: 'Updated Program',
  status: 'active',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T01:00:00Z',
  metadata: null,
  creator: null,
  updater: null,
  portfolio: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

describe('useUpdateProgram', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls UPDATE_PROGRAM mutation with the correct id and input', async () => {
    mockRequest.mockResolvedValue({ updateProgram: sampleUpdatedProgram })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateProgram(), { wrapper: Wrapper })

    result.current.mutate({ id: 'prog-1', input: { version: 1, name: 'Updated Program' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      id: 'prog-1',
      input: { version: 1, name: 'Updated Program' },
    })
  })

  it('returns the updated program detail on success', async () => {
    mockRequest.mockResolvedValue({ updateProgram: sampleUpdatedProgram })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateProgram(), { wrapper: Wrapper })

    result.current.mutate({ id: 'prog-1', input: { version: 1, name: 'Updated Program' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('prog-1')
    expect(result.current.data?.version).toBe(2)
    expect(result.current.data?.name).toBe('Updated Program')
  })

  it('invalidates PROGRAMS_QUERY_KEY, PROGRAM_QUERY_KEY, and PORTFOLIOS_QUERY_KEY on success', async () => {
    mockRequest.mockResolvedValue({ updateProgram: sampleUpdatedProgram })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateProgram(), { wrapper: Wrapper })

    result.current.mutate({ id: 'prog-1', input: { version: 1 } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys).toContainEqual(['programs'])
    expect(calledKeys).toContainEqual(['programs', 'prog-1'])
    expect(calledKeys).toContainEqual(['portfolios'])
  })

  it('exposes an error when the mutation fails', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateProgram(), { wrapper: Wrapper })

    result.current.mutate({ id: 'prog-1', input: { version: 1 } })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
