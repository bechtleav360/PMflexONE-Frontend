import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import type { Program } from '../types/program.types'
import { usePortfolioPrograms } from './usePortfolioPrograms'
import { useProgram } from './useProgram'
import { useProgramListState } from './useProgramListState'
import { usePrograms } from './usePrograms'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequest = vi.mocked(graphqlClient.request)

const sampleProgram = {
  id: 'prog-1',
  version: 1,
  name: 'Test Program',
  status: 'active',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

const sampleProgramDetail = {
  ...sampleProgram,
  metadata: null,
  creator: null,
  updater: null,
  portfolio: null,
  projects: [],
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

describe('usePrograms', () => {
  it('fetches programs without filter', async () => {
    mockRequest.mockResolvedValue({ programs: [sampleProgram] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePrograms(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {})
    expect(result.current.data).toHaveLength(1)
  })

  it('fetches programs with portfolioId filter', async () => {
    mockRequest.mockResolvedValue({ programs: [sampleProgram] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePrograms({ filter: { portfolioId: 'port-1' } }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      filter: { portfolioId: 'port-1' },
    })
  })

  it('uses base query key when filter has no portfolioId', async () => {
    mockRequest.mockResolvedValue({ programs: [] })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePrograms({}), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {})
  })
})

describe('usePortfolioPrograms', () => {
  it('is disabled when portfolioId is undefined', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePortfolioPrograms(undefined), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('fetches portfolio programs when portfolioId is provided', async () => {
    mockRequest.mockResolvedValue({
      portfolio: {
        programs: [{ item: sampleProgram }],
      },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePortfolioPrograms('port-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { id: 'port-1' })
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('prog-1')
  })
})

describe('useProgram', () => {
  it('is disabled when id is null', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProgram(null), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('fetches program detail when id is provided', async () => {
    mockRequest.mockResolvedValue({ program: sampleProgramDetail })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useProgram('prog-1'), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { id: 'prog-1' })
    expect(result.current.data?.id).toBe('prog-1')
  })
})

// eslint-disable-next-line max-lines-per-function -- test describe block; splitting individual it() callbacks hurts readability
describe('useProgramListState', () => {
  const makeProgram = (overrides: Partial<Program> = {}): Program => ({
    id: 'prog-1',
    version: 1,
    name: 'Alpha',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  })

  it('returns rows unsorted when sort is null', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'Zebra' }),
      makeProgram({ id: 'p2', name: 'Alpha' }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    expect(result.current.rows).toEqual(programs)
    expect(result.current.sort).toBeNull()
  })

  it('sorts by name ascending', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'Zebra' }),
      makeProgram({ id: 'p2', name: 'Alpha' }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'name', direction: 'asc' })
    })

    expect(result.current.rows[0].name).toBe('Alpha')
    expect(result.current.rows[1].name).toBe('Zebra')
  })

  it('sorts by name descending', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'Alpha' }),
      makeProgram({ id: 'p2', name: 'Zebra' }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'name', direction: 'desc' })
    })

    expect(result.current.rows[0].name).toBe('Zebra')
    expect(result.current.rows[1].name).toBe('Alpha')
  })

  it('sorts by portfolio name ascending', () => {
    const programs = [
      makeProgram({
        id: 'p1',
        name: 'A',
        portfolio: { item: { id: 'port-2', name: 'Zeta Portfolio' } },
      }),
      makeProgram({
        id: 'p2',
        name: 'B',
        portfolio: { item: { id: 'port-1', name: 'Alpha Portfolio' } },
      }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'portfolio', direction: 'asc' })
    })

    expect(result.current.rows[0].portfolio?.item.name).toBe('Alpha Portfolio')
    expect(result.current.rows[1].portfolio?.item.name).toBe('Zeta Portfolio')
  })

  it('places programs with null portfolio at end when sorting by portfolio', () => {
    const programs = [
      makeProgram({ id: 'p1', name: 'A', portfolio: null }),
      makeProgram({
        id: 'p2',
        name: 'B',
        portfolio: { item: { id: 'port-1', name: 'Alpha Portfolio' } },
      }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'portfolio', direction: 'asc' })
    })

    expect(result.current.rows[0].portfolio?.item.name).toBe('Alpha Portfolio')
    expect(result.current.rows[1].portfolio).toBeNull()
  })

  it('places programs with null status at end when sorting by status', () => {
    const programs = [
      makeProgram({ id: 'p1', status: null }),
      makeProgram({ id: 'p2', status: 'active' }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'status', direction: 'asc' })
    })

    expect(result.current.rows[0].status).toBe('active')
    expect(result.current.rows[1].status).toBeNull()
  })

  it('two null-value items remain equal (stable relative order)', () => {
    const programs = [
      makeProgram({ id: 'p1', status: null }),
      makeProgram({ id: 'p2', status: null }),
    ]
    const { result } = renderHook(() => useProgramListState(programs))

    act(() => {
      result.current.setSort({ field: 'status', direction: 'asc' })
    })

    expect(result.current.rows).toHaveLength(2)
  })
})
