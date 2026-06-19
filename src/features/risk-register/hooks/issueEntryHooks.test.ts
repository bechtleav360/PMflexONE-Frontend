import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateIssueEntry } from './useCreateIssueEntry'
import { useIssueEntries } from './useIssueEntries'
import { useIssueEntry } from './useIssueEntry'
import { useIssueEntryStatuses } from './useIssueEntryStatuses'
import { useUpdateIssueEntry } from './useUpdateIssueEntry'

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
  owner: null,
  reporter: null,
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

// eslint-disable-next-line max-lines-per-function -- describe blocks grow with each new filter parameter under test
describe('useIssueEntries', () => {
  it('calls graphqlClient with scoped filter', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntries({ scopeType: 'Project', scopeId: proj1 }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: {
        scopeType: 'Project',
        scopeId: proj1,
        includeTerminalStatuses: false,
      },
    })
  })

  it('calls graphqlClient with portfolio scope filter', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useIssueEntries({ scopeType: 'Portfolio', scopeId: 'port-1' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: {
        scopeType: 'Portfolio',
        scopeId: 'port-1',
        includeTerminalStatuses: false,
      },
    })
  })

  it('includes terminal statuses when flag is true', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useIssueEntries({ scopeType: 'Project', scopeId: proj1, includeTerminalStatuses: true }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: {
        scopeType: 'Project',
        scopeId: proj1,
        includeTerminalStatuses: true,
      },
    })
  })

  it('passes status filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useIssueEntries({ scopeType: 'Project', scopeId: proj1, status: 'open' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ status: 'open' }),
    })
  })

  it('passes pestelCategory filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useIssueEntries({ scopeType: 'Project', scopeId: proj1, pestelCategory: 'TECHNOLOGICAL' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ pestelCategory: 'TECHNOLOGICAL' }),
    })
  })

  it('strips null optional filter fields before sending to the API', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useIssueEntries({
          scopeType: 'Project',
          scopeId: proj1,
          status: null,
          pestelCategory: null,
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const callArgs = mockRequest.mock.calls[0] as unknown as [
      unknown,
      { filter: Record<string, unknown> },
    ]
    const [, vars] = callArgs
    expect(vars.filter).not.toHaveProperty('status')
    expect(vars.filter).not.toHaveProperty('pestelCategory')
  })

  it('returns parsed issue entries', async () => {
    mockRequest.mockResolvedValue({ issueEntries: [sampleIssueEntry] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntries({ scopeType: 'Project', scopeId: proj1 }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('i-1')
  })
})

describe('useIssueEntry', () => {
  it('fetches issue entry by id when id is provided', async () => {
    mockRequest.mockResolvedValue({ issueEntry: sampleIssueEntry })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntry('i-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('i-1')
  })

  it('is disabled when id is null', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntry(null), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('is disabled when id is undefined', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntry(undefined), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })
})

describe('useIssueEntryStatuses', () => {
  it('returns parsed status options', async () => {
    mockRequest.mockResolvedValue({
      lookupIssueEntryStatus: [{ status: 'OPEN', description: 'Open', displayOrder: 1 }],
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useIssueEntryStatuses(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([{ status: 'OPEN', description: 'Open', displayOrder: 1 }])
  })
})

describe('useCreateIssueEntry', () => {
  it('calls CREATE_ISSUE_ENTRY with scopeType and scopeId in input and invalidates cache', async () => {
    mockRequest.mockResolvedValue({ createIssueEntry: sampleIssueEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateIssueEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      name: 'Server down',
      pestelCategory: 'TECHNOLOGICAL',
      status: 'open',
      identificationDate: '2024-01-20',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledOnce()
    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          name: 'Server down',
          scopeType: 'Project',
          scopeId: proj1,
        }),
      }),
    )
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
  })

  it('does not invalidate cache when mutation fails (uses onSuccess)', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateIssueEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      name: 'Server down',
      pestelCategory: 'TECHNOLOGICAL',
      status: 'open',
      identificationDate: '2024-01-20',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(false)
  })
})

describe('useUpdateIssueEntry', () => {
  it('calls UPDATE_ISSUE_ENTRY and invalidates cache on success', async () => {
    const updatedEntry = { ...sampleIssueEntry, name: 'Updated issue' }
    mockRequest.mockResolvedValue({ updateIssueEntry: updatedEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateIssueEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'i-1', input: { version: 1, name: 'Updated issue' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      id: 'i-1',
      input: expect.objectContaining({ version: 1 }),
    })
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'issueEntries')).toBe(true)
  })

  it('returns the updated entry on success', async () => {
    const updatedEntry = { ...sampleIssueEntry, name: 'Updated issue' }
    mockRequest.mockResolvedValue({ updateIssueEntry: updatedEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateIssueEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'i-1', input: { version: 1, name: 'Updated issue' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.name).toBe('Updated issue')
  })
})
