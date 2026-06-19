import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useCreateGoal } from './useCreateGoal'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleGoal = {
  id: 'g-1',
  version: 1,
  name: 'New goal',
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

describe('useCreateGoal', () => {
  it('calls mutationFn with input merged with scope', async () => {
    mockRequest.mockResolvedValue({ createGoal: sampleGoal })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ name: 'New goal' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          name: 'New goal',
          scopeType: 'Project',
          scopeId: 'proj-1',
        }),
      }),
    )
  })

  it('invalidates goals query on success', async () => {
    mockRequest.mockResolvedValue({ createGoal: sampleGoal })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ name: 'New goal' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })

  it('does not invalidate on error', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateGoal('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ name: 'New goal' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(false)
  })
})
