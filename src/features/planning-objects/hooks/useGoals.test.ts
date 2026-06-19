import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useGoals } from './useGoals'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleGoal = {
  id: 'g-1',
  version: 1,
  sortOrder: 0,
  name: 'Increase revenue',
  description: null,
  progress: 0,
  dueDate: null,
  keyResults: null,
  otherInformation: null,
  acceptedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  acceptedBy: null,
  parent: null,
  children: [],
  scope: { id: 'proj-1', scopeType: 'Project' },
  parentLevelGoalName: null,
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

describe('useGoals', () => {
  it('returns data on success', async () => {
    mockRequest.mockResolvedValue({ goals: [sampleGoal] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoals('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('g-1')
  })

  it('calls graphqlClient with correct scope filter', async () => {
    mockRequest.mockResolvedValue({ goals: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoals('Portfolio', 'port-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: { scopeType: 'Portfolio', scopeId: 'port-1' },
    })
  })

  it('returns empty array when no goals', async () => {
    mockRequest.mockResolvedValue({ goals: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoals('Project', 'proj-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})
