import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useLookupProgramStatus } from './useLookupProgramStatus'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleStatusEntries = [
  { status: 'draft', description: 'Draft state', displayOrder: 1 },
  { status: 'active', description: 'Active program', displayOrder: 2 },
]

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

describe('useLookupProgramStatus', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('fetches and returns program status lookup entries', async () => {
    mockRequest.mockResolvedValue({ lookupProgramStatus: sampleStatusEntries })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLookupProgramStatus(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].status).toBe('draft')
    expect(result.current.data![1].status).toBe('active')
  })

  it('calls LOOKUP_PROGRAM_STATUS query without additional variables', async () => {
    mockRequest.mockResolvedValue({ lookupProgramStatus: sampleStatusEntries })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLookupProgramStatus(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything())
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })

  it('exposes an error when the query fails', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLookupProgramStatus(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
