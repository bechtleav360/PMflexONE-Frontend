import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useCreateConstraint } from './useCreateConstraint'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleMutationResult = {
  id: 'c-1',
  version: 1,
  name: 'Budget cap',
  timeConstrained: false,
  dueDate: null,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
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

describe('useCreateConstraint', () => {
  it('calls mutationFn with input merged with scope', async () => {
    mockRequest.mockResolvedValue({ createProjectConstraint: sampleMutationResult })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'Budget cap' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          name: 'Budget cap',
          scopeType: 'Project',
          scopeId: 'proj-1',
        }),
      }),
    )
  })

  it('invalidates constraints query on success', async () => {
    mockRequest.mockResolvedValue({ createProjectConstraint: sampleMutationResult })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'Budget cap' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'constraints')).toBe(true)
  })

  it('does not invalidate on error', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'Budget cap' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'constraints')).toBe(false)
  })
})
