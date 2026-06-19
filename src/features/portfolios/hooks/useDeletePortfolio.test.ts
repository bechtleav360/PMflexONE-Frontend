import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useDeletePortfolio } from './useDeletePortfolio'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useDeletePortfolio', () => {
  it('returns true on successful deletion', async () => {
    server.use(
      graphql.mutation('DeletePortfolio', () =>
        HttpResponse.json({ data: { deletePortfolio: true } }),
      ),
    )

    const { result } = renderHook(() => useDeletePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync('port-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(true)
  })

  it('sets isError on API failure', async () => {
    server.use(
      graphql.mutation('DeletePortfolio', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useDeletePortfolio(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync('port-x').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
