import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateIssueFromRisk } from './useCreateIssueFromRisk'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleIssueEntry = {
  id: 'i-1',
  version: 1,
  entryNumber: 'I-001',
  name: 'Server down',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'open',
  identificationDate: '2024-01-20',
  urgency: null,
  impact: null,
  createdAt: '2024-01-20T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

describe('useCreateIssueFromRisk', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls CREATE_ISSUE_FROM_RISK mutation with the correct riskEntryId and version', async () => {
    mockRequest.mockResolvedValue({ createIssueFromRisk: sampleIssueEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateIssueFromRisk('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ riskEntryId: 'r-1', version: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ riskEntryId: 'r-1', version: 2 }),
    )
  })

  it('invalidates RISK_ENTRIES_QUERY_KEY, ISSUE_ENTRIES_QUERY_KEY and riskEntry detail on success', async () => {
    mockRequest.mockResolvedValue({ createIssueFromRisk: sampleIssueEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateIssueFromRisk('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ riskEntryId: 'r-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntry')).toBe(true)
  })

  it('still invalidates all query keys on mutation failure (uses onSettled)', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateIssueFromRisk('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ riskEntryId: 'r-1', version: 1 })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
  })

  it('returns the created issue entry on success', async () => {
    mockRequest.mockResolvedValue({ createIssueFromRisk: sampleIssueEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateIssueFromRisk('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ riskEntryId: 'r-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('i-1')
    expect(result.current.data?.entryNumber).toBe('I-001')
  })
})
