import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProblemFromIssue } from './useCreateProblemFromIssue'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleProblemEntry = {
  id: 'p-1',
  version: 1,
  entryNumber: 'P-001',
  name: 'Server crash',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'open',
  identificationDate: '2024-01-20',
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

describe('useCreateProblemFromIssue', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('calls CREATE_PROBLEM_FROM_ISSUE mutation with the correct issueEntryId and version', async () => {
    mockRequest.mockResolvedValue({ createProblemFromIssue: sampleProblemEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProblemFromIssue('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ issueEntryId: 'i-1', version: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ issueEntryId: 'i-1', version: 2 }),
    )
  })

  it('invalidates ISSUE_ENTRIES_QUERY_KEY, PROBLEM_ENTRIES_QUERY_KEY and issueEntry detail on success', async () => {
    mockRequest.mockResolvedValue({ createProblemFromIssue: sampleProblemEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateProblemFromIssue('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ issueEntryId: 'i-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'problemEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntry')).toBe(true)
  })

  it('still invalidates all query keys on mutation failure (uses onSettled)', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateProblemFromIssue('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ issueEntryId: 'i-1', version: 1 })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'problemEntries')).toBe(true)
  })

  it('returns the created problem entry on success', async () => {
    mockRequest.mockResolvedValue({ createProblemFromIssue: sampleProblemEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateProblemFromIssue('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ issueEntryId: 'i-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('p-1')
    expect(result.current.data?.entryNumber).toBe('P-001')
  })
})
