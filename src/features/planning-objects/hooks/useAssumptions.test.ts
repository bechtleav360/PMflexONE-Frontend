import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useAssumptions } from './useAssumptions'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleAssumption = {
  id: 'a-1',
  version: 1,
  name: 'Key assumption',
  description: null,
  dueDate: null,
  validationStatus: 'open',
  isRisk: false,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  validatedBy: null,
  linkedRisk: null,
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

describe('useAssumptions', () => {
  it('returns data on success', async () => {
    mockRequest.mockResolvedValue({ assumptions: [sampleAssumption] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useAssumptions('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('a-1')
  })

  it('calls graphqlClient with correct scope filter', async () => {
    mockRequest.mockResolvedValue({ assumptions: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useAssumptions('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: { scopeType: 'Project', scopeId: 'proj-1' },
    })
  })

  it('returns empty array when no assumptions', async () => {
    mockRequest.mockResolvedValue({ assumptions: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useAssumptions('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})
