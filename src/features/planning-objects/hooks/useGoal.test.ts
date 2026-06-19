import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useGoal } from './useGoal'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleGoalDetail = {
  id: 'g-1',
  version: 1,
  sortOrder: 0,
  name: 'Increase revenue',
  description: 'Drive growth',
  progress: 50,
  dueDate: '2025-12-31',
  keyResults: null,
  impact: null,
  outcome: null,
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
  parentLevelGoal: null,
  relatedGoals: [],
  linkedRequirements: [],
  businessCase: null,
  projectCharter: null,
  initiationRequests: [],
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

describe('useGoal', () => {
  it('fetches goal detail by id', async () => {
    mockRequest.mockResolvedValue({ goal: sampleGoalDetail })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoal('g-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('g-1')
    expect(result.current.data?.description).toBe('Drive growth')
  })

  it('is disabled when id is empty string', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoal(''), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('returns null when goal not found', async () => {
    mockRequest.mockResolvedValue({ goal: null })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useGoal('g-missing'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeNull()
  })
})
