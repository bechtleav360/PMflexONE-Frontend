import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useUpdateConstraint } from './useUpdateConstraint'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleMutationResult = {
  id: 'c-1',
  version: 2,
  name: 'Budget cap updated',
  timeConstrained: false,
  dueDate: null,
  otherInformation: null,
  updatedAt: '2024-02-01T00:00:00Z',
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

describe('useUpdateConstraint', () => {
  it('sends correct payload', async () => {
    mockRequest.mockResolvedValue({ updateProjectConstraint: sampleMutationResult })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      id: 'c-1',
      input: {
        version: 1,
        name: 'Budget cap updated',
        timeConstrained: true,
        dueDate: '2024-12-31',
      },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ input: expect.objectContaining({ id: 'c-1' }) }),
    )
  })

  it('forces dueDate to null when timeConstrained is false', async () => {
    mockRequest.mockResolvedValue({ updateProjectConstraint: sampleMutationResult })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      id: 'c-1',
      input: { version: 1, timeConstrained: false, dueDate: '2024-12-31' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({ timeConstrained: false, dueDate: null }),
      }),
    )
  })

  it('preserves dueDate when timeConstrained is true', async () => {
    mockRequest.mockResolvedValue({
      updateProjectConstraint: {
        ...sampleMutationResult,
        timeConstrained: true,
        dueDate: '2024-12-31',
      },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      id: 'c-1',
      input: { version: 1, timeConstrained: true, dueDate: '2024-12-31' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({ timeConstrained: true, dueDate: '2024-12-31' }),
      }),
    )
  })

  it('invalidates constraints and constraint queries on success', async () => {
    mockRequest.mockResolvedValue({ updateProjectConstraint: sampleMutationResult })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateConstraint('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'c-1', input: { version: 1, name: 'Updated' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'constraints')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'constraint')).toBe(true)
  })
})
