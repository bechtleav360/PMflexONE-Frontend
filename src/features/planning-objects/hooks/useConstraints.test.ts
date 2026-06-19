import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useConstraints } from './useConstraints'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleConstraint = {
  id: 'c-1',
  version: 1,
  name: 'Budget cap',
  description: null,
  timeConstrained: false,
  dueDate: null,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  owner: null,
  projectCharter: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
}

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

describe('useConstraints', () => {
  it('returns data on success', async () => {
    mockRequest.mockResolvedValue({ projectConstraints: [sampleConstraint] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useConstraints('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('c-1')
  })

  it('calls graphqlClient with correct scope filter', async () => {
    mockRequest.mockResolvedValue({ projectConstraints: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useConstraints('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: { scopeType: 'Project', scopeId: 'proj-1' },
    })
  })

  it('returns empty array when no constraints', async () => {
    mockRequest.mockResolvedValue({ projectConstraints: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useConstraints('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})
