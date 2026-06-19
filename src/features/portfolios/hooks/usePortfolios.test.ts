import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { PORTFOLIOS_QUERY_KEY, usePortfolios } from './usePortfolios'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const portfolioPayload = [
  {
    id: 'port-1',
    version: 1,
    name: 'Digital Transformation',
    startYear: 2026,
    endYear: 2028,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'port-2',
    version: 1,
    name: 'Cloud Migration',
    startYear: null,
    endYear: null,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

describe('usePortfolios', () => {
  it('returns portfolios on success', async () => {
    server.use(
      graphql.query('GetPortfolios', () =>
        HttpResponse.json({ data: { portfolios: portfolioPayload } }),
      ),
    )

    const { result } = renderHook(() => usePortfolios(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.name).toBe('Digital Transformation')
  })

  it('returns an empty array when no portfolios exist', async () => {
    server.use(
      graphql.query('GetPortfolios', () => HttpResponse.json({ data: { portfolios: [] } })),
    )

    const { result } = renderHook(() => usePortfolios(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })

  it('sets isError on API failure', async () => {
    server.use(
      graphql.query('GetPortfolios', () =>
        HttpResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => usePortfolios(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('exposes a stable query key', () => {
    expect(PORTFOLIOS_QUERY_KEY).toEqual(['portfolios'])
  })
})
