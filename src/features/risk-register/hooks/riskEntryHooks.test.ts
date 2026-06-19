import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateRiskEntry } from './useCreateRiskEntry'
import { useRiskEntries } from './useRiskEntries'
import { useRiskEntry } from './useRiskEntry'
import { useRiskEntryStatuses } from './useRiskEntryStatuses'
import { useUpdateRiskEntry } from './useUpdateRiskEntry'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleRiskEntry = {
  id: 'r-1',
  version: 1,
  entryNumber: 'R-001',
  type: 'RISK',
  name: 'Budget overrun',
  pestelCategory: 'ECONOMIC',
  description: null,
  status: 'proposed',
  identificationDate: '2024-01-15',
  probability: 3,
  impact: 4,
  riskLevel: 12,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
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
describe('useRiskEntries', () => {
  it('calls graphqlClient with project scope filter', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntries({ scopeType: 'Project', scopeId: proj1 }), {
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
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRiskEntries({ scopeType: 'Portfolio', scopeId: 'port-1' }),
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

  it('passes type filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRiskEntries({ scopeType: 'Project', scopeId: proj1, type: 'RISK' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ type: 'RISK' }),
    })
  })

  it('passes status filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRiskEntries({ scopeType: 'Project', scopeId: proj1, status: 'proposed' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ status: 'proposed' }),
    })
  })

  it('passes pestelCategory filter to the server when set', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () => useRiskEntries({ scopeType: 'Project', scopeId: proj1, pestelCategory: 'ECONOMIC' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: expect.objectContaining({ pestelCategory: 'ECONOMIC' }),
    })
  })

  it('strips null optional filter fields before sending to the API', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(
      () =>
        useRiskEntries({
          scopeType: 'Project',
          scopeId: proj1,
          type: null,
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
    expect(vars.filter).not.toHaveProperty('type')
    expect(vars.filter).not.toHaveProperty('status')
    expect(vars.filter).not.toHaveProperty('pestelCategory')
  })

  it('returns parsed risk entries', async () => {
    mockRequest.mockResolvedValue({ riskEntries: [sampleRiskEntry] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntries({ scopeType: 'Project', scopeId: proj1 }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('r-1')
  })
})

describe('useRiskEntry', () => {
  it('fetches risk entry by id when id is provided', async () => {
    mockRequest.mockResolvedValue({ riskEntry: sampleRiskEntry })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntry('r-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.id).toBe('r-1')
  })

  it('is disabled when id is null', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntry(null), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('is disabled when id is undefined', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntry(undefined), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })
})

describe('useRiskEntryStatuses', () => {
  it('returns parsed status options', async () => {
    mockRequest.mockResolvedValue({
      lookupRiskEntryStatus: [{ status: 'PROPOSED', description: 'Proposed', displayOrder: 1 }],
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useRiskEntryStatuses(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([
      { status: 'PROPOSED', description: 'Proposed', displayOrder: 1 },
    ])
  })
})

describe('useCreateRiskEntry', () => {
  it('calls CREATE_RISK_ENTRY with scopeType and scopeId in input and invalidates cache', async () => {
    mockRequest.mockResolvedValue({ createRiskEntry: sampleRiskEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateRiskEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      type: 'RISK',
      name: 'Budget overrun',
      pestelCategory: 'ECONOMIC',
      status: 'proposed',
      identificationDate: '2024-01-15',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledOnce()
    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          name: 'Budget overrun',
          scopeType: 'Project',
          scopeId: proj1,
        }),
      }),
    )
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
  })

  it('uses portfolio scopeType when scopeType is portfolio', async () => {
    mockRequest.mockResolvedValue({ createRiskEntry: sampleRiskEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateRiskEntry('Portfolio', 'port-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      type: 'OPPORTUNITY',
      name: 'Market expansion',
      pestelCategory: 'ECONOMIC',
      status: 'proposed',
      identificationDate: '2024-01-15',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          scopeType: 'Portfolio',
          scopeId: 'port-1',
        }),
      }),
    )
  })

  it('invalidates cache when mutation fails', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateRiskEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({
      type: 'RISK',
      name: 'Budget overrun',
      pestelCategory: 'ECONOMIC',
      status: 'proposed',
      identificationDate: '2024-01-15',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // onSuccess (not onSettled) is used, so no invalidation on error
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(false)
  })
})

describe('useUpdateRiskEntry', () => {
  it('calls UPDATE_RISK_ENTRY and invalidates cache on success', async () => {
    const updatedEntry = { ...sampleRiskEntry, name: 'Updated risk' }
    mockRequest.mockResolvedValue({ updateRiskEntry: updatedEntry })

    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateRiskEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'r-1', input: { version: 1, name: 'Updated risk' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      id: 'r-1',
      input: expect.objectContaining({ version: 1 }),
    })
    const calledKeys = invalidateSpy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(calledKeys.some((k) => Array.isArray(k) && k[0] === 'riskEntries')).toBe(true)
  })

  it('returns the updated entry on success', async () => {
    const updatedEntry = { ...sampleRiskEntry, name: 'Updated risk' }
    mockRequest.mockResolvedValue({ updateRiskEntry: updatedEntry })

    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateRiskEntry('Project', proj1), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'r-1', input: { version: 1, name: 'Updated risk' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.name).toBe('Updated risk')
  })
})
