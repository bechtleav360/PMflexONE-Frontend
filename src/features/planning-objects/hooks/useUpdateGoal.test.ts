import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useUpdateGoal } from './useUpdateGoal'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleGoal = {
  id: 'g-1',
  version: 2,
  name: 'Updated goal',
  description: null,
  progress: 75,
  dueDate: null,
  keyResults: null,
  otherInformation: null,
  acceptedAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
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

describe('useUpdateGoal', () => {
  it('calls UPDATE_GOAL with id and input', async () => {
    mockRequest.mockResolvedValue({ updateGoal: sampleGoal })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', input: { version: 1, name: 'Updated goal', progress: 75 } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({ id: 'g-1', version: 1 }),
    })
  })

  it('invalidates goals list and goal detail on success', async () => {
    mockRequest.mockResolvedValue({ updateGoal: sampleGoal })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', input: { version: 1 } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goal' && k[1] === 'g-1')).toBe(true)
  })
})
