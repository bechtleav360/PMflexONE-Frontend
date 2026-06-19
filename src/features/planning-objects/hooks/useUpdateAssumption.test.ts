import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRiskEntryEditTarget } from '@/entities/risk-entry'
import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useUpdateAssumption } from './useUpdateAssumption'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockRequest = vi.mocked(graphqlClient.request)

const baseAssumption = {
  id: 'a-1',
  version: 2,
  name: 'Test assumption',
  description: null,
  dueDate: null,
  validationStatus: 'open',
  isRisk: false,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
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
  mockNavigate.mockReset()
  useRiskEntryEditTarget.setState({ editTargetId: null })
})

describe('useUpdateAssumption', () => {
  it('invalidates assumptions query on success', async () => {
    mockRequest.mockResolvedValue({ updateAssumption: baseAssumption })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'a-1', wasRisk: false, input: { version: 1, name: 'Updated' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'assumptions')).toBe(true)
  })

  it('FR-012: sets editTarget and navigates when isRisk=true and linkedRisk returned', async () => {
    const responseWithRisk = {
      ...baseAssumption,
      isRisk: true,
      linkedRisk: { id: 'risk-99', name: 'New Risk', status: 'proposed' },
    }
    mockRequest.mockResolvedValue({ updateAssumption: responseWithRisk })
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'a-1', wasRisk: false, input: { version: 1, isRisk: true } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useRiskEntryEditTarget.getState().editTargetId).toBe('risk-99')
    expect(mockNavigate).toHaveBeenCalledWith('/projects/proj-1/risk-management')

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
  })

  it('FR-013: does not navigate when isRisk=false (unlink handled by caller)', async () => {
    const responseWithLinkedRisk = {
      ...baseAssumption,
      isRisk: false,
      linkedRisk: { id: 'risk-99', name: 'Existing Risk', status: 'rejected' },
    }
    mockRequest.mockResolvedValue({ updateAssumption: responseWithLinkedRisk })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'a-1', wasRisk: true, input: { version: 1, isRisk: false } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useRiskEntryEditTarget.getState().editTargetId).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate when isRisk unchanged and no linkedRisk', async () => {
    mockRequest.mockResolvedValue({ updateAssumption: baseAssumption })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateAssumption('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      id: 'a-1',
      wasRisk: false,
      input: { version: 1, name: 'Updated name' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockNavigate).not.toHaveBeenCalled()
    expect(useRiskEntryEditTarget.getState().editTargetId).toBeNull()
  })
})
