import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useCreateAssumption } from './useCreateAssumption'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/entities/risk-entry/store/useRiskEntryEditTarget', () => ({
  useRiskEntryEditTarget: () => vi.fn(),
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleAssumption = {
  id: 'a-1',
  version: 1,
  name: 'New assumption',
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

describe('useCreateAssumption', () => {
  it('calls mutationFn with input merged with scope', async () => {
    mockRequest.mockResolvedValue({ createAssumption: sampleAssumption })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'New assumption', validationStatus: 'open' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          name: 'New assumption',
          scopeType: 'Project',
          scopeId: 'proj-1',
        }),
      }),
    )
  })

  it('invalidates assumptions query on success', async () => {
    mockRequest.mockResolvedValue({ createAssumption: sampleAssumption })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'New assumption', validationStatus: 'open' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'assumptions')).toBe(true)
  })

  it('does not invalidate on error', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ name: 'New assumption', validationStatus: 'open' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'assumptions')).toBe(false)
  })
})
