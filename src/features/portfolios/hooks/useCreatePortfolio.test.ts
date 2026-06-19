import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useCreatePortfolio } from './useCreatePortfolio'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const createdPortfolio = {
  id: 'port-new',
  version: 1,
  name: 'Digital Transformation',
  startYear: 2026,
  endYear: 2028,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('useCreatePortfolio', () => {
  it('returns the created portfolio on success', async () => {
    server.use(
      graphql.mutation('CreatePortfolio', () =>
        HttpResponse.json({ data: { createPortfolio: createdPortfolio } }),
      ),
    )

    const { result } = renderHook(() => useCreatePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Digital Transformation',
        startYear: 2026,
        endYear: 2028,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('port-new')
    expect(result.current.data?.name).toBe('Digital Transformation')
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('CreatePortfolio', () =>
        HttpResponse.json({ errors: [{ message: 'Name already taken' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useCreatePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current
        .mutateAsync({ name: 'Duplicate', startYear: null, endYear: null })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
