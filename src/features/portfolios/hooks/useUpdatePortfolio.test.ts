import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useUpdatePortfolio } from './useUpdatePortfolio'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const updatedPortfolio = {
  id: 'port-1',
  version: 2,
  name: 'Renamed Portfolio',
  startYear: 2026,
  endYear: 2029,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('useUpdatePortfolio', () => {
  it('returns the updated portfolio on success', async () => {
    server.use(
      graphql.mutation('UpdatePortfolio', () =>
        HttpResponse.json({ data: { updatePortfolio: updatedPortfolio } }),
      ),
    )

    const { result } = renderHook(() => useUpdatePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'port-1',
        input: { version: 1, name: 'Renamed Portfolio', startYear: 2026, endYear: 2029 },
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('port-1')
    expect(result.current.data?.version).toBe(2)
    expect(result.current.data?.name).toBe('Renamed Portfolio')
  })

  it('sets isError on version conflict', async () => {
    server.use(
      graphql.mutation('UpdatePortfolio', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useUpdatePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current
        .mutateAsync({
          id: 'port-1',
          input: { version: 1, name: 'Test', startYear: null, endYear: null },
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
