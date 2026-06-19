import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProblemEntry } from './useCreateProblemEntry'
import { useProblemEntries } from './useProblemEntries'
import { useProblemEntry } from './useProblemEntry'
import { useProblemEntryStatuses } from './useProblemEntryStatuses'
import { useUpdateProblemEntry } from './useUpdateProblemEntry'

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
  impact: 4,
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

describe('useProblemEntries', () => {
  it('calls graphqlClient with scoped filter', async () => {
    mockRequest.mockResolvedValue({ problemEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useProblemEntries({ scopeType: 'Project', scopeId: proj1 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: {
        scopeType: 'Project',
        scopeId: proj1,
        includeTerminalStatuses: false,
      },
    })
  })

  it('passes status filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ problemEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useProblemEntries({ scopeType: 'Project', scopeId: proj1, status: 'open' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ status: 'open' }),
    })
  })

  it('passes pestelCategory filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ problemEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useProblemEntries({
          scopeType: 'Project',
          scopeId: proj1,
          pestelCategory: 'TECHNOLOGICAL',
        }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ pestelCategory: 'TECHNOLOGICAL' }),
    })
  })

  it('strips null optional filter fields before sending to the API', async () => {
    mockRequest.mockResolvedValue({ problemEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useProblemEntries({
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

  it('returns parsed problem entries', async () => {
    mockRequest.mockResolvedValue({ problemEntries: [sampleProblemEntry] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useProblemEntries({ scopeType: 'Project', scopeId: proj1 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('p-1')
  })
})

describe('useProblemEntry', () => {
  it('fetches problem entry by id when id is provided', async () => {
    mockRequest.mockResolvedValue({ problemEntry: sampleProblemEntry })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProblemEntry('p-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('p-1')
  })

  it('is disabled when id is null', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProblemEntry(null), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('is disabled when id is undefined', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProblemEntry(undefined), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })
})

describe('useProblemEntryStatuses', () => {
  it('returns parsed status options', async () => {
    mockRequest.mockResolvedValue({
      lookupProblemEntryStatus: [{ status: 'OPEN', description: 'Open', displayOrder: 1 }],
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProblemEntryStatuses(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([{ status: 'OPEN', description: 'Open', displayOrder: 1 }])
  })
})

describe('useCreateProblemEntry', () => {
  it('calls CREATE_PROBLEM_ENTRY mutation and invalidates cache on settled', async () => {
    mockRequest.mockResolvedValue({ createProblemEntry: sampleProblemEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateProblemEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      name: 'Server crash',
      pestelCategory: 'TECHNOLOGICAL',
      status: 'open',
      identificationDate: '2024-01-20',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({ name: 'Server crash' }),
      }),
    )
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'problemEntries')).toBe(true)
  })

  it('still invalidates cache on mutation failure', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateProblemEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      name: 'Server crash',
      pestelCategory: 'TECHNOLOGICAL',
      status: 'open',
      identificationDate: '2024-01-20',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'problemEntries')).toBe(true)
  })
})

describe('useUpdateProblemEntry', () => {
  it('calls UPDATE_PROBLEM_ENTRY and invalidates cache on success', async () => {
    const updatedEntry = { ...sampleProblemEntry, name: 'Updated issue' }
    mockRequest.mockResolvedValue({ updateProblemEntry: updatedEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateProblemEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'p-1', input: { version: 1, name: 'Updated issue' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      id: 'p-1',
      input: expect.objectContaining({ version: 1 }),
    })
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'problemEntries')).toBe(true)
  })

  it('returns the updated entry on success', async () => {
    const updatedEntry = { ...sampleProblemEntry, name: 'Updated issue' }
    mockRequest.mockResolvedValue({ updateProblemEntry: updatedEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateProblemEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'p-1', input: { version: 1, name: 'Updated issue' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.name).toBe('Updated issue')
  })
})
